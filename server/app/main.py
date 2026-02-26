from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from contextlib import asynccontextmanager

# Ensure the project root and server directory are on sys.path so local stubs
# (like `optimum` placed at the repo root) and `app` modules can be imported
# regardless of the current working directory used to start the app.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
SERVER_DIR = Path(__file__).resolve().parent.parent
for p in (str(PROJECT_ROOT), str(SERVER_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from app.core.config import settings
from app.api.routes import upload, chat, search, amd_showcase
from app.services.llm_service import llm_service

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup/shutdown lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    logger.info("🚀 Starting PrivateScholar AI...")
    
    # Load model on startup (skip if configured)
    if getattr(settings, 'SKIP_MODEL_LOAD', False):
        logger.warning("⚠️  SKIP_MODEL_LOAD=True - Starting without loading model")
        logger.warning("⚠️  Chat functionality will not work until model is loaded")
    else:
        try:
            await llm_service.load_model()
            logger.info("✅ LLM model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            logger.warning("⚠️  Starting without LLM - chat functionality will be limited")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🛑 Shutting down PrivateScholar AI...")
    llm_service.unload_model()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Privacy-first, on-device research assistant powered by AMD",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(amd_showcase.router)  # AMD Showcase endpoints


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "Welcome to PrivateScholar AI - Your research. Your device. Your privacy.",
        "docs": "/docs",
        "powered_by": "AMD + AirLLM"
    }


# Health check
@app.get("/health")
async def health():
    """System health check"""
    import torch
    
    try:
        gpu_available = torch.cuda.is_available()
    except Exception:
        gpu_available = False
    
    return {
        "status": "healthy",
        "model_loaded": llm_service.model is not None,
        "device": llm_service.device,
        "gpu_available": gpu_available,
        "timestamp": time.time()
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "path": str(request.url)}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )