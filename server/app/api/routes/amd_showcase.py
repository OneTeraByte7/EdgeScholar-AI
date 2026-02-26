"""
AMD Showcase API Routes
Special endpoints for AMD Slingshot Hackathon features
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.amd_optimizer import amd_optimizer
from app.services.research_analytics import ResearchAnalytics
from app.services.vector_service import vector_db as vector_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/amd", tags=["AMD Showcase"])

# Initialize research analytics
research_analytics = ResearchAnalytics(vector_service)


class AnalyticsRequest(BaseModel):
    """Request for research analytics"""
    collection_name: Optional[str] = "research_papers"
    topic: Optional[str] = None


@router.get("/hardware-status")
async def get_hardware_status():
    """
    Get current AMD hardware status and optimization level
    
    **AMD Showcase Feature**: Real-time hardware monitoring
    """
    try:
        status = amd_optimizer.get_hardware_status()
        showcase = amd_optimizer.get_amd_showcase_info()
        recommendations = amd_optimizer.get_recommendations()
        
        return {
            "status": "success",
            "hardware": status,
            "amd_showcase": showcase,
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"Hardware status error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/research-analytics")
async def get_research_analytics():
    """
    Get comprehensive research corpus analytics
    
    **AMD Showcase Feature**: Advanced document intelligence
    
    Returns:
        - Corpus overview statistics
        - Key research themes
        - Methodology patterns
        - Research gaps identification
        - Citation analysis
        - Personalized recommendations
    """
    try:
        analytics = research_analytics.analyze_research_corpus()
        
        return {
            "status": "success",
            "analytics": analytics,
            "powered_by": "AMD AI Infrastructure"
        }
    except Exception as e:
        logger.error(f"Research analytics error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/research-summary")
async def get_research_summary(topic: Optional[str] = None):
    """
    Get natural language summary of research corpus
    
    **AMD Showcase Feature**: AI-powered research insights
    
    Query Parameters:
        - topic: Optional topic to focus the summary on
    """
    try:
        summary = research_analytics.generate_research_summary(topic)
        
        return {
            "status": "success",
            "summary": summary,
            "generated_at": "AMD-powered AI"
        }
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/performance-metrics")
async def get_performance_metrics():
    """
    Get real-time performance metrics
    
    **AMD Showcase Feature**: Performance monitoring and optimization
    """
    try:
        hardware = amd_optimizer.get_hardware_status()
        
        metrics = {
            "cpu_usage": hardware.get("cpu_usage_percent", 0),
            "ram_usage": hardware.get("ram_usage_percent", 0),
            "optimization_level": hardware.get("optimization_level", "Unknown"),
            "performance_estimate": amd_optimizer._estimate_performance(),
            "hardware_tier": amd_optimizer._determine_hardware_tier(),
            "amd_advantages": [
                "🔒 100% Private - No cloud dependency",
                "⚡ Fast - Local processing with AMD acceleration",
                "💰 Cost-effective - No API fees",
                "🎯 Accurate - On-device inference",
                "🌐 Offline-capable - Works without internet"
            ]
        }
        
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        logger.error(f"Performance metrics error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/showcase")
async def get_amd_showcase():
    """
    Complete AMD Showcase Information
    
    **AMD Slingshot Hackathon Feature**: Comprehensive system information
    
    Demonstrates:
    - AMD hardware detection
    - ROCm integration
    - Performance optimization
    - Research analytics
    - Real-time monitoring
    """
    try:
        hardware_status = amd_optimizer.get_hardware_status()
        showcase_info = amd_optimizer.get_amd_showcase_info()
        analytics = research_analytics.analyze_research_corpus()
        
        return {
            "status": "success",
            "project": {
                "name": "Vigor AI",
                "tagline": "Your Research. Your Device. Your Privacy. Powered by AMD.",
                "hackathon": "AMD AI Slingshot Hackathon 2025"
            },
            "amd_integration": {
                "hardware_detection": hardware_status,
                "amd_showcase": showcase_info,
                "performance": amd_optimizer._estimate_performance()
            },
            "research_intelligence": {
                "analytics_available": True,
                "corpus_stats": analytics.get("corpus_overview", {}),
                "features": [
                    "Multi-document analysis",
                    "Research gap identification",
                    "Citation network analysis",
                    "Methodology extraction",
                    "Theme clustering"
                ]
            },
            "unique_value_propositions": [
                "🔐 Privacy-First: 100% on-device processing",
                "🚀 AMD-Powered: ROCm GPU acceleration",
                "🎯 Intelligent: Advanced research analytics",
                "💡 Open-Source: Community-driven development",
                "📊 Real-time: Performance monitoring dashboard"
            ]
        }
    except Exception as e:
        logger.error(f"Showcase error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
