from fastapi import APIRouter, HTTPException
import logging
from app.api.models import SearchRequest, SearchResponse
from app.services.vector_service import vector_db

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)


@router.post("/semantic", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    """Perform semantic search across research documents"""
    
    try:
        results = vector_db.search(
            query=request.query,
            n_results=request.n_results,
            filter_metadata=request.filter_metadata
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results["documents"])):
            # Convert distance to a similarity score in (0,1]:
            # similarity = 1 / (1 + distance)
            try:
                dist = float(results.get("distances", [0])[i])
            except Exception:
                dist = 0.0
            similarity = 1.0 / (1.0 + max(dist, 0.0))
            # Clamp to [0.0, 1.0]
            similarity = max(0.0, min(1.0, similarity))

            formatted_results.append({
                "text": results["documents"][i],
                "metadata": results["metadatas"][i],
                "relevance_score": similarity,
                "chunk_id": results["ids"][i]
            })
        
        return SearchResponse(
            results=formatted_results,
            query=request.query,
            total_results=len(formatted_results)
        )
    
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_collection_stats():
    """Get vector database statistics"""
    try:
        stats = vector_db.get_collection_stats()
        return {
            "status": "success",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))