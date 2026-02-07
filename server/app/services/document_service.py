import logging
import fitz  # PyMuPDF
from typing import List, Dict
from pathlib import Path
import hashlib
from app.core.config import settings

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Service for processing research papers and extracting content"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def process_pdf(self, file_path: Path) -> Dict:
        """Extract text, metadata, and citations from PDF"""
        try:
            doc = fitz.open(file_path)
            
            # Extract metadata
            metadata = {
                "title": doc.metadata.get("title", file_path.stem),
                "author": doc.metadata.get("author", "Unknown"),
                "page_count": doc.page_count,
                "file_name": file_path.name,
                "file_size": file_path.stat().st_size
            }
            
            # Extract text from all pages
            full_text = ""
            pages = []
            
            for page_num, page in enumerate(doc, start=1):
                text = page.get_text()
                full_text += text
                pages.append({
                    "page_number": page_num,
                    "text": text,
                    "word_count": len(text.split())
                })
            
            doc.close()
            
            # Generate document ID
            doc_id = self._generate_doc_id(file_path)
            
            # Extract potential citations (simple regex-based)
            citations = self._extract_citations(full_text)
            
            return {
                "doc_id": doc_id,
                "metadata": metadata,
                "full_text": full_text,
                "pages": pages,
                "citations": citations,
                "total_words": len(full_text.split())
            }
            
        except Exception as e:
            logger.error(f"Failed to process PDF {file_path}: {e}")
            raise
    
    def chunk_text(
        self,
        text: str,
        chunk_size: int = None,
        overlap: int = None
    ) -> List[str]:
        """Split text into overlapping chunks for embedding"""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
        return chunks
    
    def _generate_doc_id(self, file_path: Path) -> str:
        """Generate unique document ID from file path"""
        return hashlib.md5(str(file_path).encode()).hexdigest()[:16]
    
    def _extract_citations(self, text: str) -> List[str]:
        """Extract potential citations (simplified)"""
        import re
        
        # Match patterns like [1], (Smith et al., 2020), etc.
        citation_patterns = [
            r'\[\d+\]',  # [1], [2], etc.
            r'\([A-Z][a-z]+\s+et\s+al\.,\s+\d{4}\)',  # (Smith et al., 2020)
            r'\([A-Z][a-z]+\s+and\s+[A-Z][a-z]+,\s+\d{4}\)'  # (Smith and Jones, 2020)
        ]
        
        citations = []
        for pattern in citation_patterns:
            matches = re.findall(pattern, text)
            citations.extend(matches)
        
        return list(set(citations))[:50]  # Return up to 50 unique citations


# Global service instance
doc_processor = DocumentProcessor()