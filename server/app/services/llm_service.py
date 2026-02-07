import logging
from typing import Optional, AsyncGenerator
from airllm import AutoModel
import torch
from app.core.config import settings

logger = logging.getLogger(__name__)


class AirLLMService:
    """Service for managing AirLLM model inference with AMD GPU support"""
    
    def __init__(self):
        self.model: Optional[AutoModel] = None
        self.device = "cuda" if settings.USE_GPU and torch.cuda.is_available() else "cpu"
        logger.info(f"Initializing AirLLM on device: {self.device}")
    
    async def load_model(self):
        """Load the LLM model using AirLLM's layer-wise loading"""
        if self.model is not None:
            logger.info("Model already loaded")
            return
        
        try:
            logger.info(f"Loading model: {settings.MODEL_NAME}")
            
            # AirLLM automatically handles layer-wise loading for large models
            self.model = AutoModel.from_pretrained(
                settings.MODEL_NAME,
                cache_dir=str(settings.CACHE_DIR),
                device_map="auto" if settings.USE_GPU else "cpu",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
            
            logger.info("Model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate text from the model"""
        
        if self.model is None:
            await self.load_model()
        
        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE
        
        try:
            # Prepare input
            inputs = self.model.tokenizer(prompt, return_tensors="pt")
            
            if stream:
                # Streaming generation
                async for token in self._generate_stream(inputs, max_tokens, temperature):
                    yield token
            else:
                # Standard generation
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=self.model.tokenizer.eos_token_id
                )
                
                response = self.model.tokenizer.decode(outputs[0], skip_special_tokens=True)
                return response
                
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise
    
    async def _generate_stream(self, inputs, max_tokens, temperature):
        """Internal method for streaming generation"""
        # Simplified streaming - implement proper token-by-token in production
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            pad_token_id=self.model.tokenizer.eos_token_id
        )
        
        response = self.model.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Simulate streaming by yielding chunks
        words = response.split()
        for i in range(0, len(words), 5):
            yield " ".join(words[i:i+5]) + " "
    
    def unload_model(self):
        """Free up GPU memory"""
        if self.model is not None:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("Model unloaded and cache cleared")


# Global service instance
llm_service = AirLLMService()