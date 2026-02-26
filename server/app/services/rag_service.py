"""
Enhanced RAG Service - Fixes hallucinations, improves citations, and speeds up responses
"""
import logging
from typing import List, Dict, Tuple
from app.services.vector_service import vector_db
from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """
    Retrieval-Augmented Generation service
    Handles context retrieval, prompt engineering, and citation management
    """
    
    def __init__(self):
        self.vector_db = vector_db
        # Reduce max context significantly for faster responses
        self.max_context_tokens = 1024  # ~4096 characters (reduced from 2048)
        self.max_doc_chars = 800  # Truncate individual docs (reduced from 1500)
        
    def retrieve_context(
        self, 
        query: str, 
        n_results: int = 5,
        min_relevance: float = 0.0
    ) -> Tuple[str, List[Dict]]:
        """
        Retrieve relevant context from vector DB with quality filtering
        
        Args:
            query: User question
            n_results: Maximum number of results
            min_relevance: Minimum relevance threshold (0-1)
            
        Returns:
            Tuple of (formatted_context, sources_list)
        """
        # Step 1: Search vector database
        search_results = self.vector_db.search(
            query=query,
            n_results=n_results
        )
        
        if not search_results["documents"]:
            logger.warning("No documents found in vector DB")
            return "", []
        
        # Step 2: Filter by relevance and remove duplicates
        context_parts = []
        sources = []
        seen_texts = set()
        current_chars = 0
        max_context_chars = self.max_context_tokens * 4
        
        for i, (doc, metadata, distance) in enumerate(zip(
            search_results["documents"],
            search_results["metadatas"],
            search_results["distances"]
        )):
            # Convert distance to relevance score (ChromaDB uses cosine distance)
            # Lower distance = higher similarity
            # Typical range: 0 (identical) to 2 (opposite)
            relevance_score = max(0.0, min(1.0, 1 - (distance / 2)))
            
            # Skip low-relevance results
            if relevance_score < min_relevance:
                logger.info(f"Skipping source {i+1} with low relevance: {relevance_score:.2f}")
                continue
            
            # Remove duplicate or very similar texts
            doc_hash = hash(doc[:200])  # Hash first 200 chars
            if doc_hash in seen_texts:
                logger.info(f"Skipping duplicate source {i+1}")
                continue
            seen_texts.add(doc_hash)
            
            # Truncate document to avoid token overflow
            doc_preview = doc[:self.max_doc_chars] if len(doc) > self.max_doc_chars else doc
            
            # Clean the text
            doc_preview = self._clean_text(doc_preview)
            
            # Check if adding this would exceed limit
            addition = f"\n--- Document {len(context_parts)+1} ---\n{doc_preview}\n"
            if current_chars + len(addition) > max_context_chars:
                logger.warning(f"Context truncated at {len(context_parts)} sources to fit token limit")
                break
            
            context_parts.append(addition)
            current_chars += len(addition)
            
            # Add to sources list
            sources.append({
                "index": len(sources) + 1,
                "file_name": metadata.get("file_name", "Unknown"),
                "title": metadata.get("title", "Untitled"),
                "relevance_score": round(relevance_score, 3)
            })
            
            logger.info(f"Added source {len(sources)}: {metadata.get('file_name')} (relevance: {relevance_score:.2f})")
        
        if not context_parts:
            logger.warning("No relevant context found after filtering")
            return "", []
        
        context = "".join(context_parts).strip()
        logger.info(f"Retrieved {len(sources)} sources, {current_chars} characters (~{current_chars//4} tokens)")
        
        return context, sources
    
    def build_rag_prompt(self, query: str, context: str) -> str:
        """
        Build optimized RAG prompt with clear instructions
        
        Args:
            query: User question
            context: Retrieved context from documents
            
        Returns:
            Formatted prompt string
        """
        if not context:
            # No context available - inform user
            prompt = f"""You are a research assistant. The user has asked a question, but there are no relevant documents uploaded yet.

Question: {query}

Instructions:
- Politely inform the user that no documents have been uploaded yet
- Suggest they upload research papers or documents first
- Keep your response brief and helpful

Answer:"""
        else:
            # Normal RAG prompt with context
            prompt = f"""You are a knowledgeable research assistant analyzing academic documents. Provide clear, natural responses like a human expert would.

Context from the uploaded research documents:
{context}

User Question: {query}

Instructions:
- Answer naturally and conversationally, as if explaining to a colleague
- Base your answer ONLY on the information provided in the context above
- Write in clear paragraphs with proper flow - do NOT use bullet points or numbered lists
- Do NOT include any citation markers like [Source 1] or references in your response
- If the context doesn't fully answer the question, acknowledge what you can't determine
- Be concise but thorough - provide 3-5 well-structured sentences
- Use natural transitions between ideas
- Write as if you're having a conversation, not writing a formal report

Response:"""
        
        return prompt
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = " ".join(text.split())
        
        # Remove common PDF artifacts
        text = text.replace("\x00", "")
        text = text.replace("\ufffd", "")
        
        # Ensure proper sentence spacing
        text = text.replace(". ", ".\n")
        text = text.replace("? ", "?\n")
        text = text.replace("! ", "!\n")
        
        return text.strip()
    
    def deduplicate_sources(self, sources: List[Dict]) -> List[Dict]:
        """
        Remove duplicate sources based on file_name
        
        Args:
            sources: List of source dictionaries
            
        Returns:
            Deduplicated list of sources
        """
        seen = {}
        deduplicated = []
        
        for source in sources:
            file_name = source.get("file_name")
            
            # If we haven't seen this file, add it
            if file_name not in seen:
                seen[file_name] = source
                deduplicated.append(source)
            else:
                # If we've seen it, keep the one with higher relevance
                existing = seen[file_name]
                if source.get("relevance_score", 0) > existing.get("relevance_score", 0):
                    # Replace with higher relevance version
                    deduplicated.remove(existing)
                    deduplicated.append(source)
                    seen[file_name] = source
        
        # Re-index
        for i, source in enumerate(deduplicated):
            source["index"] = i + 1
        
        logger.info(f"Deduplicated sources: {len(sources)} -> {len(deduplicated)}")
        return deduplicated
    
    def clean_response_format(self, response: str) -> str:
        """
        Clean response to remove citation markers and improve formatting
        
        Args:
            response: Generated response text
            
        Returns:
            Cleaned response text
        """
        import re
        
        # Remove citation markers like [Source 1], [1], etc.
        response = re.sub(r'\[Source\s*\d+\]', '', response)
        response = re.sub(r'\[\d+\]', '', response)
        response = re.sub(r'\(Source\s*\d+\)', '', response)
        response = re.sub(r'\(\d+\)', '', response)
        
        # Remove reference patterns like "according to source 1"
        response = re.sub(r'according to source \d+', '', response, flags=re.IGNORECASE)
        response = re.sub(r'as stated in source \d+', '', response, flags=re.IGNORECASE)
        response = re.sub(r'source \d+ mentions', '', response, flags=re.IGNORECASE)
        
        # Clean up multiple spaces
        response = re.sub(r'\s+', ' ', response)
        
        # Clean up multiple newlines
        response = re.sub(r'\n\s*\n\s*\n+', '\n\n', response)
        
        # Fix spacing around punctuation
        response = re.sub(r'\s+([.,!?])', r'\1', response)
        response = re.sub(r'([.,!?])([^\s])', r'\1 \2', response)
        
        return response.strip()
    
    def validate_response(self, response: str, sources: List[Dict]) -> Tuple[str, bool]:
        """
        Validate AI response for quality issues
        
        Args:
            response: Generated response
            sources: List of sources
            
        Returns:
            Tuple of (cleaned_response, is_valid)
        """
        # Check for empty response
        if not response or len(response.strip()) < 10:
            logger.warning("Response too short or empty")
            return "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.", False
        
        # Check for excessive repetition (hallucination indicator)
        words = response.split()
        if len(words) > 20:
            # Check if more than 30% of words are repeated
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.3:
                logger.warning(f"Excessive repetition detected (unique ratio: {unique_ratio:.2f})")
                return "I apologize, but the response quality was poor. Please try asking your question differently.", False
        
        # Check for gibberish (many short tokens or numbers)
        tokens = response.split()
        short_tokens = sum(1 for t in tokens if len(t) <= 2)
        if len(tokens) > 10 and short_tokens / len(tokens) > 0.5:
            logger.warning(f"Possible gibberish detected (short token ratio: {short_tokens/len(tokens):.2f})")
            return "I apologize, but the response quality was poor. Please try asking your question differently.", False
        
        # Clean up response
        response = response.strip()
        
        # Remove repeated spaces
        while "  " in response:
            response = response.replace("  ", " ")
        
        # Remove repeated newlines
        while "\n\n\n" in response:
            response = response.replace("\n\n\n", "\n\n")
        
        return response, True


# Global instance
rag_service = RAGService()
