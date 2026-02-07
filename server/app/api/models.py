from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class ChatRequest(BaseModel):
    """Request model for chat/query endpoint"""
    message: str = Field(..., min_length=1, max_length=5000)
    context_doc_ids: Optional[List[str]] = []
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(1024, ge=100, le=4096)
    stream: bool = False


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str
    sources: List[Dict] = []
    processing_time: float


class DocumentUploadResponse(BaseModel):
    """Response after document upload"""
    doc_id: str
    file_name: str
    page_count: int
    total_words: int
    chunks_created: int
    status: str = "processed"


class SearchRequest(BaseModel):
    """Request for semantic search"""
    query: str = Field(..., min_length=1)
    n_results: int = Field(5, ge=1, le=20)
    filter_metadata: Optional[Dict] = None


class SearchResponse(BaseModel):
    """Response from semantic search"""
    results: List[Dict]
    query: str
    total_results: int


class DocumentMetadata(BaseModel):
    """Metadata for a document"""
    doc_id: str
    title: str
    author: str
    page_count: int
    file_name: str
    upload_date: datetime
    word_count: int


class SystemStatus(BaseModel):
    """System health status"""
    status: str
    model_loaded: bool
    gpu_available: bool
    total_documents: int
    uptime: float