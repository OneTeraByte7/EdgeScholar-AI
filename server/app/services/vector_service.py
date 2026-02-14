import logging
from typing import List, Dict
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

logger = logging.getLogger(__name__)


class VectorDBService:
    """Service for managing document embeddings and semantic search"""
    
    def __init__(self):
        self.embedding_model: SentenceTransformer = None
        self.chroma_client: chromadb.Client = None
        self.collection = None
        self._initialize()
    
    def _initialize(self):
        """Initialize embedding model and ChromaDB"""
        try:
            # Load embedding model
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            
            # Initialize ChromaDB
            settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
            
            self.chroma_client = chromadb.Client(ChromaSettings(
                persist_directory=str(settings.CHROMA_PERSIST_DIR),
                anonymized_telemetry=False
            ))
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="research_documents",
                metadata={"description": "Research papers and documents"}
            )
            
            logger.info("Vector database initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector DB: {e}")
            raise
    
    def add_documents(
        self,
        texts: List[str],
        metadatas: List[Dict],
        ids: List[str]
    ):
        """Add documents to the vector database"""
        try:
            # Generate embeddings
            embeddings = self.embedding_model.encode(texts).tolist()
            
            # Add to ChromaDB
            self.collection.add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(texts)} documents to vector DB")
            
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            raise
    
    def search(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Dict = None
    ) -> Dict:
        """Perform semantic search"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=n_results,
                where=filter_metadata
            )
            
            # Log search results for debugging
            logger.info(f"Search query: '{query[:100]}...'")
            logger.info(f"Found {len(results['documents'][0]) if results['documents'] else 0} results")
            if results['distances'] and results['distances'][0]:
                logger.info(f"Distance range: [{min(results['distances'][0]):.4f}, {max(results['distances'][0]):.4f}]")
            
            return {
                "documents": results["documents"][0] if results["documents"] else [],
                "metadatas": results["metadatas"][0] if results["metadatas"] else [],
                "distances": results["distances"][0] if results["distances"] else [],
                "ids": results["ids"][0] if results["ids"] else []
            }
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def delete_document(self, doc_id: str):
        """Delete a document from the database"""
        try:
            self.collection.delete(ids=[doc_id])
            logger.info(f"Deleted document: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            raise
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection"""
        return {
            "total_documents": self.collection.count(),
            "embedding_dimension": len(self.embedding_model.encode(["test"])[0])
        }


# Global service instance
vector_db = VectorDBService()