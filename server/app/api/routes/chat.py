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
            n_results=5
        )
        
        # Step 2: Build context from search results
        context_parts = []
        sources = []
        
        for i, (doc, metadata) in enumerate(zip(
            search_results["documents"],
            search_results["metadatas"]
        )):
            context_parts.append(f"[Source {i+1}]: {doc}")
            sources.append({
                "index": i + 1,
                "file_name": metadata.get("file_name", "Unknown"),
                "title": metadata.get("title", "Untitled"),
                "relevance_score": 1 - search_results["distances"][i]  # Convert distance to similarity
            })
        
        context = "\n\n".join(context_parts) if context_parts else "No relevant context found."
        
        # Step 3: Build prompt with context
        prompt = f"""You are a research assistant helping with academic work. Answer the following question based on the provided research papers.

Research Context:
{context}

Question: {request.message}

Instructions:
- Provide a clear, well-reasoned answer based on the context
- Cite sources using [Source N] notation
- If the context doesn't contain relevant information, say so
- Be concise but thorough

Answer:"""
        
        # Step 4: Generate response
        if request.stream:
            # Return streaming response
            async def generate_stream():
                async for chunk in llm_service.generate(
                    prompt=prompt,
                    max_tokens=request.max_tokens,
                    temperature=request.temperature,
                    stream=True
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
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                stream=False
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