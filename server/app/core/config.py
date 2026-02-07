from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "EdgeScholar AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "developnment"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    MODEL_NAME: str = "meta-llama/Llama-3.1-70B_Instruct"
    MODEL_PATH: Path = Path("./models/downloaded")
    CACHE_DIR: Path = Path("./models/cache")
    MAX_TOKENS: int = 4096
    TEMPARATURE: float = 0.7
    
    USE_GPU: bool = True
    GPU_DEVICE: int = 0
    
    CHROMA_PERSIST_DIR: Path = Path("./data/embeddings")
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    
    UPLOAD_DIR: Path = Path("./data/uploads")
    MAX_UPLOAD_SIZE: int = 52428800
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx"," .txt"]
    
    CITATION_DIR: Path = Path("./data/citations")
    DEFAULT_CITATION_STYLE: str = "IEEE"
    
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Path = Path("./logs/app.log")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
        
settings = Settings()