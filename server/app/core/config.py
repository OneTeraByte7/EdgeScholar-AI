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