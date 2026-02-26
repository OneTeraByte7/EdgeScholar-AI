"""
Research Analytics Engine - Advanced Document Intelligence
Powered by AMD for Slingshot Hackathon
"""
import logging
from typing import List, Dict, Optional
from collections import Counter
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class ResearchAnalytics:
    """
    Advanced Research Document Analytics
    
    Features:
    - Multi-document comparison
    - Research gap identification
    - Citation network analysis
    - Topic clustering
    - Methodology extraction
    """
    
    def __init__(self, vector_service):
        self.vector_service = vector_service
        
    def analyze_research_corpus(self, collection_name: str = "research_papers") -> Dict:
        """
        Comprehensive analysis of entire research corpus
        
        Returns:
            Analytics report with insights
        """
        try:
            # Get all documents from the collection
            all_docs = self.vector_service.collection.get()
            
            if not all_docs or not all_docs.get("documents"):
                return {
                    "status": "no_documents",
                    "message": "No documents found for analysis"
                }
            
            documents = all_docs["documents"]
            metadatas = all_docs.get("metadatas", [])
            
            analysis = {
                "timestamp": datetime.now().isoformat(),
                "corpus_overview": self._analyze_corpus_overview(documents, metadatas),
                "key_themes": self._extract_key_themes(documents),
                "methodology_patterns": self._identify_methodologies(documents),
                "research_gaps": self._identify_research_gaps(documents),
                "citation_insights": self._analyze_citations(documents),
                "recommendations": self._generate_recommendations(documents)
            }
            
            logger.info(f"Research corpus analysis complete: {len(documents)} documents")
            return analysis
            
        except Exception as e:
            logger.error(f"Research analytics error: {e}")
            return {"error": str(e)}
    
    def _analyze_corpus_overview(self, documents: List[str], metadatas: List[Dict]) -> Dict:
        """Analyze overall corpus statistics"""
        total_words = sum(len(doc.split()) for doc in documents)
        avg_length = total_words / len(documents) if documents else 0
        
        # Extract unique file names
        files = set()
        for meta in metadatas:
            if meta and "file_name" in meta:
                files.add(meta["file_name"])
        
        return {
            "total_documents": len(documents),
            "total_chunks": len(documents),
            "unique_papers": len(files),
            "total_words": total_words,
            "avg_chunk_length": round(avg_length, 0),
            "corpus_size_mb": round(sum(len(doc.encode('utf-8')) for doc in documents) / (1024*1024), 2)
        }
    
    def _extract_key_themes(self, documents: List[str]) -> List[Dict]:
        """Extract key themes and topics from documents"""
        # Common research keywords and phrases
        research_keywords = [
            "machine learning", "deep learning", "neural network", "artificial intelligence",
            "data analysis", "methodology", "experiment", "hypothesis", "results",
            "conclusion", "algorithm", "model", "framework", "approach", "technique",
            "performance", "accuracy", "evaluation", "dataset", "training", "testing",
            "optimization", "classification", "regression", "clustering", "prediction"
        ]
        
        keyword_counts = Counter()
        text = " ".join(documents).lower()
        
        for keyword in research_keywords:
            count = text.count(keyword)
            if count > 0:
                keyword_counts[keyword] = count
        
        # Get top 10 themes
        top_themes = [
            {"theme": theme, "frequency": count, "relevance": "high" if count > 10 else "medium"}
            for theme, count in keyword_counts.most_common(10)
        ]
        
        return top_themes
    
    def _identify_methodologies(self, documents: List[str]) -> List[Dict]:
        """Identify research methodologies mentioned"""
        methodologies = {
            "Quantitative": ["quantitative", "statistical", "numerical", "metric", "measurement"],
            "Qualitative": ["qualitative", "interview", "survey", "observation", "case study"],
            "Experimental": ["experiment", "trial", "test", "controlled", "randomized"],
            "Computational": ["computational", "simulation", "algorithm", "model", "implementation"],
            "Comparative": ["comparison", "comparative", "versus", "benchmark", "baseline"],
            "Literature Review": ["literature review", "systematic review", "meta-analysis"]
        }
        
        text = " ".join(documents).lower()
        found_methodologies = []
        
        for method, keywords in methodologies.items():
            count = sum(text.count(keyword) for keyword in keywords)
            if count > 3:  # Threshold
                found_methodologies.append({
                    "methodology": method,
                    "mentions": count,
                    "confidence": "high" if count > 10 else "medium"
                })
        
        return sorted(found_methodologies, key=lambda x: x["mentions"], reverse=True)
    
    def _identify_research_gaps(self, documents: List[str]) -> List[str]:
        """Identify potential research gaps"""
        gap_indicators = [
            "future work", "further research", "limitation", "not addressed",
            "remains unclear", "needs investigation", "requires further",
            "unexplored", "gap in", "little is known", "limited research"
        ]
        
        text = " ".join(documents).lower()
        gaps = []
        
        for indicator in gap_indicators:
            if indicator in text:
                # Extract context around the indicator
                pattern = f".{{0,100}}{re.escape(indicator)}.{{0,100}}"
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in list(matches)[:2]:  # Limit to 2 per indicator
                    context = match.group().strip()
                    if len(context) > 20:
                        gaps.append(context)
        
        return gaps[:5]  # Return top 5 gaps
    
    def _analyze_citations(self, documents: List[str]) -> Dict:
        """Analyze citation patterns"""
        text = " ".join(documents)
        
        # Count various citation patterns
        bracket_citations = len(re.findall(r'\[\d+\]|\(\d{4}\)|\[.*?\d{4}.*?\]', text))
        et_al_citations = len(re.findall(r'et al\.', text, re.IGNORECASE))
        
        # Estimate total citations
        total_citations = bracket_citations + et_al_citations
        
        return {
            "estimated_total_citations": total_citations,
            "citation_density": round(total_citations / len(documents) if documents else 0, 2),
            "citation_style_indicators": {
                "numeric_brackets": bracket_citations,
                "author_year": et_al_citations
            }
        }
    
    def _generate_recommendations(self, documents: List[str]) -> List[Dict]:
        """Generate research recommendations based on corpus"""
        recommendations = []
        
        # Check corpus size
        if len(documents) < 10:
            recommendations.append({
                "type": "corpus_expansion",
                "title": "Expand Your Research Corpus",
                "description": "Upload more papers to enable deeper insights and pattern recognition.",
                "action": "Upload 5-10 more related papers"
            })
        
        # Check for methodology diversity
        text = " ".join(documents).lower()
        if text.count("experiment") < 3 and text.count("method") > 10:
            recommendations.append({
                "type": "methodology",
                "title": "Explore Experimental Validation",
                "description": "Your corpus is methodology-heavy. Consider papers with experimental results.",
                "action": "Search for experimental studies in your domain"
            })
        
        # Check for recent research
        year_pattern = r'20[12]\d'
        years = re.findall(year_pattern, text)
        if years:
            latest_year = max(map(int, years))
            if latest_year < 2020:
                recommendations.append({
                    "type": "recency",
                    "title": "Add Recent Research",
                    "description": f"Most papers appear to be from {latest_year} or earlier.",
                    "action": "Include papers from 2020-2024 for current trends"
                })
        
        return recommendations
    
    def compare_papers(self, file_names: List[str]) -> Dict:
        """
        Compare multiple papers side-by-side
        
        Args:
            file_names: List of file names to compare
            
        Returns:
            Comparison analysis
        """
        try:
            # This would query specific papers and compare them
            # Implementation depends on metadata structure
            return {
                "comparison": "multi-paper",
                "papers": file_names,
                "note": "Detailed comparison requires document retrieval by filename"
            }
        except Exception as e:
            logger.error(f"Paper comparison error: {e}")
            return {"error": str(e)}
    
    def generate_research_summary(self, topic: str = None) -> str:
        """
        Generate natural language summary of research corpus
        
        Args:
            topic: Optional topic to focus on
            
        Returns:
            Human-readable summary
        """
        try:
            analysis = self.analyze_research_corpus()
            
            if "error" in analysis or analysis.get("status") == "no_documents":
                return "No research documents available for analysis."
            
            overview = analysis["corpus_overview"]
            themes = analysis.get("key_themes", [])
            methodologies = analysis.get("methodology_patterns", [])
            
            summary_parts = []
            
            # Overview
            summary_parts.append(
                f"Your research corpus contains {overview['unique_papers']} papers "
                f"with {overview['total_chunks']} analyzed sections."
            )
            
            # Themes
            if themes:
                top_3_themes = [t["theme"] for t in themes[:3]]
                summary_parts.append(
                    f"The dominant research themes are: {', '.join(top_3_themes)}."
                )
            
            # Methodologies
            if methodologies:
                top_method = methodologies[0]["methodology"]
                summary_parts.append(
                    f"The primary research methodology appears to be {top_method}."
                )
            
            # Recommendations
            recs = analysis.get("recommendations", [])
            if recs:
                summary_parts.append(
                    f"Consider: {recs[0]['description']}"
                )
            
            return " ".join(summary_parts)
            
        except Exception as e:
            logger.error(f"Summary generation error: {e}")
            return "Unable to generate research summary."
