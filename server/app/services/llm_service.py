import logging
import os
from typing import Optional, AsyncGenerator
import torch
from app.core.config import settings
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class AirLLMService:
    """Service for managing LLM inference with CPU support"""
    
    def __init__(self):
        self.model: Optional[any] = None
        self.tokenizer: Optional[any] = None
        # Check if CUDA/ROCm is actually available
        try:
            cuda_available = torch.cuda.is_available()
        except Exception:
            cuda_available = False
        
        self.device = "cuda" if settings.USE_GPU and cuda_available else "cpu"
        logger.info(f"Initializing LLM service on device: {self.device}")
        
        if settings.USE_GPU and not cuda_available:
            logger.warning("GPU requested but not available. Using CPU mode.")
        
        # Determine if we should use AirLLM or standard transformers
        # AirLLM is for very large models (7B+), transformers for smaller ones
        self.use_airllm = self._should_use_airllm()
        logger.info(f"Using {'AirLLM' if self.use_airllm else 'Transformers'} for model loading")
    
    def _should_use_airllm(self) -> bool:
        """Determine if we should use AirLLM based on model name"""
        model_name_lower = settings.MODEL_NAME.lower()
        # Use standard transformers for smaller models
        small_models = ['tinyllama', 'phi-2', 'gpt2', 'distilgpt2']
        return not any(sm in model_name_lower for sm in small_models)
    
    async def load_model(self):
        """Load the LLM model using appropriate method"""
        if self.model is not None:
            logger.info("Model already loaded")
            return
        
        try:
            logger.info(f"Loading model: {settings.MODEL_NAME}")

            # Set environment variables
            if getattr(settings, "HUGGINGFACE_HUB_TOKEN", ""):
                os.environ.setdefault("HUGGINGFACE_HUB_TOKEN", settings.HUGGINGFACE_HUB_TOKEN)
            
            # Disable symlinks on Windows to avoid permission issues
            os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
            os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"

            # Set HF_HOME for cache
            if "HF_HOME" not in os.environ:
                cache_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".cache", "huggingface")
                os.environ["HF_HOME"] = cache_dir
                logger.info(f"Set HF_HOME to: {cache_dir}")
            
            if self.use_airllm:
                await self._load_with_airllm()
            else:
                await self._load_with_transformers()

            logger.info("✅ Model loaded successfully!")

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    async def _load_with_transformers(self):
        """Load model using standard transformers library"""
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        logger.info("Loading with standard Transformers library")
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            settings.MODEL_NAME,
            trust_remote_code=True
        )
        
        # Load model
        self.model = AutoModelForCausalLM.from_pretrained(
            settings.MODEL_NAME,
            torch_dtype=torch.float32,  # Use float32 for CPU
            device_map=None,
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )
        
        # Move to CPU explicitly
        self.model = self.model.to(self.device)
        self.model.eval()
        
        logger.info(f"Model loaded on {self.device}")
    
    async def _load_with_airllm(self):
        """Load model using AirLLM for large models"""
        logger.info("Loading with AirLLM for layer-wise loading")
        # Import AirLLM lazily to avoid top-level import errors when the
        # package or its optional dependencies (e.g. transformers.quantizers)
        # are not available in the environment. Importing here allows the
        # application to start and gracefully fall back to the standard
        # transformers loader when AirLLM cannot be imported.
        try:
            from airllm import AutoModel
        except Exception as ie:
            logger.error(f"AirLLM import failed: {ie}")
            raise
        
        # Force CPU mode for PyTorch if GPU is not available
        if self.device == 'cpu':
            torch.cuda.is_available = lambda: False
            logger.info("Forcing CPU mode for model loading")
        
        # Try with compression first, fall back to no compression
        try:
            if self.device == 'cpu':
                logger.info("Attempting to load with 4-bit compression")
                self.model = AutoModel.from_pretrained(
                    settings.MODEL_NAME,
                    compression='4bit'
                )
            else:
                self.model = AutoModel.from_pretrained(settings.MODEL_NAME)
        except Exception as compression_err:
            err_msg = str(compression_err).lower()
            if 'bitsandbytes' in err_msg or 'compression' in err_msg or 'cuda' in err_msg:
                logger.warning(f"Compression/CUDA issue: {compression_err}")
                logger.info("Loading model without compression")
                self.model = AutoModel.from_pretrained(settings.MODEL_NAME)
            else:
                raise

        except Exception as e:
            err_str = str(e)
            logger.error(f"Failed to load model: {err_str}")

            # Common tokenizer JSON deserialization error (tokenizers mismatch)
            if "PyPreTokenizerTypeWrapper" in err_str or "pre_tokenizer" in err_str.lower():
                logger.info("Detected tokenizer compatibility issue, attempting to patch...")
                try:
                    hf_home = os.environ.get("HF_HOME") or os.environ.get("TRANSFORMERS_CACHE")
                    if hf_home:
                        hf_home_path = Path(hf_home)
                        # Search for tokenizer.json under the hub snapshots
                        candidates = list(hf_home_path.rglob("tokenizer.json"))
                        target = None
                        for c in candidates:
                            if settings.MODEL_NAME.replace("/", "--") in str(c):
                                target = c
                                break
                        if target is None and candidates:
                            target = candidates[0]

                        if target and target.exists():
                            bak = target.with_suffix(target.suffix + ".bak")
                            try:
                                # Make backup
                                if not bak.exists():
                                    import shutil
                                    shutil.copy2(target, bak)
                                
                                with target.open("r", encoding="utf-8") as fh:
                                    data = json.load(fh)

                                # Replace pre_tokenizer with a simple one
                                modified = False
                                if isinstance(data, dict) and "pre_tokenizer" in data:
                                    data["pre_tokenizer"] = {"type": "Whitespace"}
                                    modified = True

                                if modified:
                                    with target.open("w", encoding="utf-8") as fh:
                                        json.dump(data, fh, ensure_ascii=False, indent=2)
                                    logger.info(f"Patched tokenizer.json at {target}, retrying model load...")
                                    
                                    # Retry model load without compression issues
                                    try:
                                        if self.device == 'cpu':
                                            self.model = AutoModel.from_pretrained(
                                                settings.MODEL_NAME,
                                                compression='4bit'
                                            )
                                        else:
                                            self.model = AutoModel.from_pretrained(settings.MODEL_NAME)
                                    except Exception as retry_err:
                                        if 'bitsandbytes' in str(retry_err).lower():
                                            logger.warning("Compression not available, loading without it")
                                            self.model = AutoModel.from_pretrained(settings.MODEL_NAME)
                                        else:
                                            raise
                                    
                                    logger.info("✅ Model loaded successfully after tokenizer patch")
                                    return

                            except Exception as inner_e:
                                logger.error(f"Failed to patch tokenizer: {inner_e}")
                                # Restore backup if it exists
                                if bak.exists() and target.exists():
                                    import shutil
                                    shutil.copy2(bak, target)

                except Exception as search_err:
                    logger.error(f"Error during tokenizer patch: {search_err}")

            # If we reach here, re-raise so upper layers can decide to continue without LLM
            raise
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
    ) -> str:
        """Standard (non-streaming) generation returning full response string."""

        if self.model is None:
            await self.load_model()

        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE

        try:
            if self.use_airllm:
                # AirLLM method
                inputs = self.model.tokenizer(prompt, return_tensors="pt")
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=self.model.tokenizer.eos_token_id,
                )
                response = self.model.tokenizer.decode(outputs[0], skip_special_tokens=True)
            else:
                # Standard transformers method
                inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
                
                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_new_tokens=max_tokens,
                        temperature=temperature,
                        do_sample=True,
                        pad_token_id=self.tokenizer.eos_token_id,
                    )
                
                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
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
        """Async generator for streaming generation (yields chunks)."""
        if self.model is None:
            await self.load_model()

        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE

        # Prepare input
        inputs = self.model.tokenizer(prompt, return_tensors="pt")

        async for chunk in self._generate_stream(inputs, max_tokens, temperature):
            yield chunk
    
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