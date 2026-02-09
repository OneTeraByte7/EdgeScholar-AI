"""
LLM Service with Advanced Multi-Backend Support
Uses the new ModelLoader for automatic backend selection and quantization
"""
import logging
from typing import Optional, AsyncGenerator
from app.core.config import settings
from app.services.model_loader import model_loader

logger = logging.getLogger(__name__)


class AirLLMService:
    """
    Service for managing LLM inference with multi-backend support
    Automatically selects optimal backend (AirLLM/vLLM/GGUF/Transformers)
    """
    
    def __init__(self):
        self.loader = model_loader
        logger.info(f"Initializing LLM service with model: {settings.MODEL_NAME}")
        logger.info(f"Backend: {settings.MODEL_TYPE}, Quantization: {settings.QUANTIZATION}")
    
    async def load_model(self):
        """Load the LLM model using optimal backend"""
        try:
            await self.loader.load_model()
            logger.info(f"✅ Model loaded: {self.loader.model_config}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
    ) -> str:
        """
        Generate response (non-streaming)
        Automatically uses optimal backend
        """
        if self.loader.model is None:
            await self.load_model()
        
        try:
            response = await self.loader.generate(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise

    async def generate_stream(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream tokens in real-time
        Proper token-by-token streaming (not simulated)
        """
        if self.loader.model is None:
            await self.load_model()

        try:
            async for chunk in self.loader.generate_stream(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            ):
                yield chunk
        except Exception as e:
            logger.error(f"Streaming generation failed: {e}")
            raise
    
    def unload_model(self):
        """Free up memory"""
        self.loader.unload_model()
        logger.info("Model unloaded")
    
    def get_model_info(self) -> dict:
        """Get current model configuration"""
        return self.loader.model_config


# Global service instance
llm_service = AirLLMService()
