import os
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

# Ensure caches and model downloads go into the repository workspace instead of C: drive
# Project root: f:/AMD/VigorAI
PROJECT_ROOT = Path(__file__).resolve().parents[3]
CACHE_ROOT = PROJECT_ROOT / ".cache"
TMP_ROOT = PROJECT_ROOT / "tmp"

# Create cache/tmp directories early
for d in (CACHE_ROOT, TMP_ROOT):
    d.mkdir(parents=True, exist_ok=True)

# Redirect common ML lib caches into the project cache directory
os.environ.setdefault("TRANSFORMERS_CACHE", str(CACHE_ROOT / "transformers"))
os.environ.setdefault("HF_HOME", str(CACHE_ROOT / "huggingface"))
os.environ.setdefault("HF_DATASETS_CACHE", str(CACHE_ROOT / "datasets"))
os.environ.setdefault("TORCH_HOME", str(CACHE_ROOT / "torch"))
os.environ.setdefault("XDG_CACHE_HOME", str(CACHE_ROOT))
os.environ.setdefault("TMPDIR", str(TMP_ROOT))
# Disable symlinks on Windows to avoid permission issues
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS", "1")

class Settings(BaseSettings):
    APP_NAME: str = "Vigor AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "developnment"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # Model Configuration - Supports multiple model types
    # Phi-3-mini: 3.8B params, ~8GB (4GB with 4-bit), GPT-3.5 quality
    MODEL_NAME: str = "microsoft/Phi-3-mini-4k-instruct"
    MODEL_TYPE: str = "gguf"  # Using GGUF for fast CPU inference
    MODEL_PATH: Path = PROJECT_ROOT / "server" / "app" / "models" / "downloaded"  # Absolute path
    CACHE_DIR: Path = PROJECT_ROOT / "server" / "app" / "models" / "cache"
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7
    QUANTIZATION: str = "4bit"  # GGUF handles this internally
    
    # Set to True to skip model loading on startup (for testing)
    SKIP_MODEL_LOAD: bool = False
    
    USE_GPU: bool = False
    GPU_DEVICE: int = 0
    
    CHROMA_PERSIST_DIR: Path = PROJECT_ROOT / "server" / "app" / "data" / "embeddings"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    
    UPLOAD_DIR: Path = PROJECT_ROOT / "server" / "app" / "data" / "uploads"
    MAX_UPLOAD_SIZE: int = 52428800
    # Keep raw string in env to avoid pydantic JSON decoding errors; will parse below
    ALLOWED_EXTENSIONS_RAW: str = ".pdf,.docx,.txt"
    
    CITATION_DIR: Path = PROJECT_ROOT / "server" / "app" / "data" / "citations"
    DEFAULT_CITATION_STYLE: str = "IEEE"
    
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    # Hugging Face token (set via env or server/.env). Keep empty by default.
    HUGGINGFACE_HUB_TOKEN: str = "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"
    # Keep raw string for env parsing; will convert to list after instantiation
    CORS_ORIGINS_RAW: str = "http://localhost:3000,http://localhost:5173"
    
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Path = PROJECT_ROOT / "server" / "app" / "logs" / "app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

    # Note: ALLOWED_EXTENSIONS parsing is done after instantiation to avoid
    # DotEnvSettingsSource attempting to json.loads the value for List fields.
        
        
settings = Settings()

# Parse allowed extensions from raw env value into a list and set on the settings
raw_ext = getattr(settings, "ALLOWED_EXTENSIONS_RAW", "") or ""
parsed_ext = [e.strip() for e in raw_ext.split(",") if e.strip()]
setattr(settings, "ALLOWED_EXTENSIONS", parsed_ext)

# Parse CORS origins from raw env value into a list and set on the settings
raw_cors = getattr(settings, "CORS_ORIGINS_RAW", "") or ""
parsed_cors = [e.strip() for e in raw_cors.split(",") if e.strip()]
setattr(settings, "CORS_ORIGINS", parsed_cors)

# Ensure important app directories exist (respect .env overrides)
for d in (
    settings.CACHE_DIR,
    settings.MODEL_PATH,
    settings.CHROMA_PERSIST_DIR,
    settings.UPLOAD_DIR,
    settings.CITATION_DIR,
    settings.LOG_FILE.parent,
):
    try:
        Path(d).mkdir(parents=True, exist_ok=True)
    except Exception:
        pass