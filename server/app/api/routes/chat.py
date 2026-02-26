from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import logging
import time
from app.api.models import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """Process a research query with enhanced RAG"""
    
    start_time = time.time()
    
    try:
        logger.info(f"Processing query: {request.message[:100]}...")
        
        # Step 1: Retrieve relevant context using RAG service
        context, sources = rag_service.retrieve_context(
            query=request.message,
            n_results=3,  # Reduced from 5 for faster processing
            min_relevance=0.0  # Accept all results due to embedding distance issues
        )
        
        # Step 2: Deduplicate sources
        sources = rag_service.deduplicate_sources(sources)
        
        # Step 3: Build optimized RAG prompt
        prompt = rag_service.build_rag_prompt(
            query=request.message,
            context=context
        )
        
        # Log prompt length for debugging
        prompt_tokens = len(prompt) // 4
        logger.info(f"Prompt length: ~{prompt_tokens} tokens")
        logger.info(f"Sources: {len(sources)}")
        
        # Step 4: Adjust max_tokens to leave room for prompt
        # For CPU: Limit to 256 tokens for fast responses (<1 min)
        # Default context length: 4096 tokens
        # Reserve space for prompt + some buffer
        available_tokens = 4096 - prompt_tokens - 100
        max_response_tokens = min(request.max_tokens or 256, available_tokens, 256)
        
        if max_response_tokens < 100:
            logger.warning(f"Very limited token space: {max_response_tokens}")
            max_response_tokens = 256  # Use default and hope for the best
        
        logger.info(f"Max response tokens: {max_response_tokens}")
        
        # Step 5: Generate response
        if request.stream:
            # Return streaming response
            async def generate_stream():
                async for chunk in llm_service.generate_stream(
                    prompt=prompt,
                    max_tokens=max_response_tokens,
                    temperature=request.temperature or 0.1,  # Very low temp for fast, factual responses
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
                max_tokens=max_response_tokens,
                temperature=request.temperature or 0.1,  # Very low temp for fast, factual responses
            )
            
            # Step 6: Validate response quality
            response_text, is_valid = rag_service.validate_response(response_text, sources)
            
            if not is_valid:
                logger.warning("Response failed validation")
            
            processing_time = time.time() - start_time
            logger.info(f"Query processed in {processing_time:.2f}s")
            
            return ChatResponse(
                response=response_text,
                sources=sources,
                processing_time=processing_time
            )
    
    except Exception as e:
        logger.error(f"Chat query failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check if chat service is ready"""
    return {
        "status": "healthy",
        "model_loaded": llm_service.model is not None,
        "message": "Chat service is operational"
    }