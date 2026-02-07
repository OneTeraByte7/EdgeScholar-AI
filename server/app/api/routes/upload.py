from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import logging
from app.api.models import DocumentUploadResponse
from app.services.document_service import doc_processor
from app.services.vector_service import vector_db
from app.core.config import settings

router = APIRouter(prefix="/upload", tags=["documents"])
logger = logging.getLogger(__name__)


@router.post("/document", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a research document (PDF)"""
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    try:
        # Save file
        file_id = str(uuid.uuid4())
        save_path = settings.UPLOAD_DIR / f"{file_id}{file_ext}"
        
        with open(save_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"File saved: {save_path}")
        
        # Process document
        doc_data = doc_processor.process_pdf(save_path)
        
        # Chunk text for embeddings
        chunks = doc_processor.chunk_text(doc_data["full_text"])
        
        # Add to vector database
        chunk_ids = [f"{doc_data['doc_id']}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "doc_id": doc_data["doc_id"],
                "file_name": doc_data["metadata"]["file_name"],
                "title": doc_data["metadata"]["title"],
                "chunk_index": i
            }
            for i in range(len(chunks))
        ]
        
        vector_db.add_documents(
            texts=chunks,
            metadatas=metadatas,
            ids=chunk_ids
        )
        
        logger.info(f"Document processed: {doc_data['doc_id']}")
        
        return DocumentUploadResponse(
            doc_id=doc_data["doc_id"],
            file_name=file.filename,
            page_count=doc_data["metadata"]["page_count"],
            total_words=doc_data["total_words"],
            chunks_created=len(chunks),
            status="processed"
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")