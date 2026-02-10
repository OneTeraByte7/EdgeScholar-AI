from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import logging
import time
from app.api.models import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.vector_service import vector_db

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """Process a research query with RAG"""
    
    start_time = time.time()
    
    try:
        # Step 1: Retrieve relevant context from vector DB
        search_results = vector_db.search(
            query=request.message,
            n_results=3  # Reduced from 5 to fit in context window
        )
        
        # Step 2: Build context from search results
        context_parts = []
        sources = []
        
        # Estimate tokens: ~4 chars = 1 token
        # Reserve: 1000 tokens for prompt/instructions, 500 for response
        max_context_chars = (4096 - 1500) * 4  # ~10,384 characters
        current_chars = 0
        
        for i, (doc, metadata) in enumerate(zip(
            search_results["documents"],
            search_results["metadatas"]
        )):
            # Truncate each document chunk if needed
            doc_preview = doc[:2000] if len(doc) > 2000 else doc
            
            # Check if adding this would exceed limit
            addition = f"[Source {i+1}]: {doc_preview}\n\n"
            if current_chars + len(addition) > max_context_chars:
                logger.warning(f"Context truncated at {i+1} sources to fit token limit")
                break
                
            context_parts.append(f"[Source {i+1}]: {doc_preview}")
            current_chars += len(addition)
            
            sources.append({
                "index": i + 1,
                "file_name": metadata.get("file_name", "Unknown"),
                "title": metadata.get("title", "Untitled"),
                "relevance_score": 1 - search_results["distances"][i]  # Convert distance to similarity
            })
        
        context = "\n\n".join(context_parts) if context_parts else "No relevant context found."
        
        # Step 3: Build prompt with context
        prompt = f"""You are a research assistant. Answer based on the provided research papers.

Research Context:
{context}

Question: {request.message}

Instructions:
- Provide a clear answer based on the context
- Cite sources using [Source N] notation
- Be concise but thorough

Answer:"""
        
        # Log prompt length for debugging
        logger.info(f"Prompt length: ~{len(prompt) // 4} tokens (estimated)")
        
        # Step 4: Generate response
        if request.stream:
            # Return streaming response
            async def generate_stream():
                async for chunk in llm_service.generate_stream(
                    prompt=prompt,
                    max_tokens=min(request.max_tokens, 500),  # Cap response length
                    temperature=request.temperature,
                ):
                    yield chunk

            return StreamingResponse(
                generate_stream(),
                media_type="text/plain"
            )
        else:
            # Standard response
            response_text = await llm_service.generate(
                prompt=prompt,
                max_tokens=min(request.max_tokens, 500),  # Cap response length
                temperature=request.temperature,
            )
            
            processing_time = time.time() - start_time
            
            return ChatResponse(
                response=response_text,
                sources=sources,
                processing_time=processing_time
            )
    
    except Exception as e:
        logger.error(f"Chat query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check if chat service is ready"""
    return {
        "status": "healthy",
        "model_loaded": llm_service.model is not None,
        "message": "Chat service is operational"
    }