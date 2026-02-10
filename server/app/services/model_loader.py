"""
Advanced Model Loader with Multi-Backend Support
Supports: AirLLM, vLLM, llama.cpp (GGUF), and HuggingFace Transformers
Auto-detects hardware and applies optimal quantization
"""
import logging
import os
import psutil
import torch
from typing import Optional, Dict, Any, AsyncGenerator
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)


class HardwareDetector:
    """Detect hardware capabilities and recommend quantization"""
    
    @staticmethod
    def detect() -> Dict[str, Any]:
        """Detect system hardware and return capabilities"""
        info = {
            "cpu_cores": psutil.cpu_count(logical=False),
            "ram_gb": psutil.virtual_memory().total / (1024**3),
            "available_ram_gb": psutil.virtual_memory().available / (1024**3),
            "cuda_available": False,
            "rocm_available": False,
            "gpu_memory_gb": 0,
            "recommended_backend": "transformers",
            "recommended_quantization": "4bit"
        }
        
        # Check CUDA/ROCm
        try:
            if torch.cuda.is_available():
                info["cuda_available"] = True
                info["gpu_memory_gb"] = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                info["recommended_backend"] = "vllm" if info["gpu_memory_gb"] > 8 else "airllm"
                info["recommended_quantization"] = "none" if info["gpu_memory_gb"] > 16 else "4bit"
        except Exception as e:
            logger.warning(f"GPU detection failed: {e}")
        
        # Check for AMD ROCm
        try:
            import torch_directml
            info["rocm_available"] = True
            info["recommended_backend"] = "transformers"
        except ImportError:
            pass
        
        # Recommend based on RAM for CPU-only
        if not info["cuda_available"] and not info["rocm_available"]:
            if info["available_ram_gb"] < 8:
                info["recommended_backend"] = "gguf"
                info["recommended_quantization"] = "4bit"
            else:
                # For CPU: Use transformers without quantization (quantization causes segfaults)
                info["recommended_backend"] = "transformers"
                info["recommended_quantization"] = "none"
        
        logger.info(f"Hardware detected: {info}")
        return info


class ModelLoader:
    """Unified model loader supporting multiple backends"""
    
    def __init__(self):
        self.hardware = HardwareDetector.detect()
        self.model = None
        self.tokenizer = None
        self.backend = None
        self.model_config = {}
        
    def determine_backend(self) -> str:
        """Determine which backend to use based on config and hardware"""
        if settings.MODEL_TYPE != "auto":
            return settings.MODEL_TYPE
        
        # Check if GGUF model
        if "gguf" in settings.MODEL_NAME.lower():
            return "gguf"
        
        # Use hardware recommendation
        return self.hardware["recommended_backend"]
    
    def determine_quantization(self) -> str:
        """Determine quantization level"""
        if settings.QUANTIZATION != "auto":
            return settings.QUANTIZATION
        
        return self.hardware["recommended_quantization"]
    
    async def load_model(self):
        """Load model using optimal backend"""
        if self.model is not None:
            logger.info("Model already loaded")
            return
        
        self.backend = self.determine_backend()
        quantization = self.determine_quantization()
        
        logger.info(f"Loading {settings.MODEL_NAME} with backend={self.backend}, quantization={quantization}")
        
        try:
            if self.backend == "gguf":
                await self._load_gguf(quantization)
            elif self.backend == "vllm":
                await self._load_vllm(quantization)
            elif self.backend == "airllm":
                await self._load_airllm(quantization)
            else:  # transformers
                await self._load_transformers(quantization)
            
            logger.info(f"✅ Model loaded successfully with {self.backend} backend")
            self.model_config = {
                "backend": self.backend,
                "quantization": quantization,
                "model_name": settings.MODEL_NAME,
                "hardware": self.hardware
            }
            
        except Exception as e:
            logger.error(f"Failed to load model with {self.backend}: {e}")
            # Try fallback to transformers
            if self.backend != "transformers":
                logger.info("Attempting fallback to transformers backend")
                await self._load_transformers(quantization)
                self.backend = "transformers"
                self.model_config = {
                    "backend": self.backend,
                    "quantization": quantization,
                    "model_name": settings.MODEL_NAME,
                    "hardware": self.hardware
                }
            else:
                raise
    
    async def _load_gguf(self, quantization: str):
        """Load GGUF quantized model with llama-cpp-python"""
        try:
            from llama_cpp import Llama
            
            # Check if model is local GGUF file or HF repo
            model_path = None
            
            # Use absolute path
            abs_model_path = settings.MODEL_PATH.resolve()
            logger.info(f"Looking for GGUF model in: {abs_model_path}")
            logger.info(f"Path exists: {abs_model_path.exists()}")
            logger.info(f"Is directory: {abs_model_path.is_dir() if abs_model_path.exists() else 'N/A'}")
            
            if abs_model_path.exists():
                if abs_model_path.is_file() and str(abs_model_path).endswith('.gguf'):
                    model_path = str(abs_model_path)
                    logger.info(f"Found GGUF file: {model_path}")
                elif abs_model_path.is_dir():
                    # Look for GGUF file in directory
                    gguf_files = list(abs_model_path.glob("*.gguf"))
                    logger.info(f"Found {len(gguf_files)} GGUF files in directory")
                    if gguf_files:
                        for f in gguf_files:
                            logger.info(f"  - {f.name} ({f.stat().st_size / 1e9:.2f} GB)")
                        model_path = str(gguf_files[0])
                        logger.info(f"Using GGUF file: {model_path}")
            else:
                logger.error(f"Path does not exist: {abs_model_path}")
            
            if not model_path:
                logger.error(f"No GGUF file found in {abs_model_path}")
                raise FileNotFoundError(f"Could not find GGUF file in {abs_model_path}")
            
            # Configure based on hardware
            n_gpu_layers = 0
            if self.hardware["cuda_available"]:
                n_gpu_layers = -1  # Offload all layers to GPU
            
            logger.info(f"Loading GGUF model from: {model_path}")
            self.model = Llama(
                model_path=model_path,
                n_ctx=settings.MAX_TOKENS,
                n_gpu_layers=n_gpu_layers,
                n_threads=self.hardware["cpu_cores"],
                verbose=False
            )
            
            logger.info(f"GGUF model loaded successfully from {model_path}")
            
        except ImportError:
            raise ImportError("llama-cpp-python not installed. Install with: pip install llama-cpp-python")
    
    async def _load_vllm(self, quantization: str):
        """Load model with vLLM for high-performance inference"""
        try:
            from vllm import LLM, SamplingParams
            
            # vLLM configuration
            kwargs = {
                "model": settings.MODEL_NAME,
                "max_model_len": settings.MAX_TOKENS,
                "gpu_memory_utilization": 0.9,
                "trust_remote_code": True
            }
            
            # Add quantization if needed
            if quantization in ["4bit", "8bit"]:
                kwargs["quantization"] = "awq" if quantization == "4bit" else "squeezellm"
            
            self.model = LLM(**kwargs)
            self.tokenizer = self.model.get_tokenizer()
            
            logger.info("vLLM model loaded")
            
        except ImportError:
            raise ImportError("vLLM not installed. Install with: pip install vllm")
        except Exception as e:
            logger.error(f"vLLM loading failed: {e}")
            raise
    
    async def _load_airllm(self, quantization: str):
        """Load large model with AirLLM (layer-wise loading)"""
        try:
            from airllm import AutoModel
            
            # Force CPU mode if no GPU
            if not self.hardware["cuda_available"]:
                torch.cuda.is_available = lambda: False
            
            # AirLLM uses positional argument, not keyword
            self.model = AutoModel.from_pretrained(
                settings.MODEL_NAME,
                compression="4bit" if quantization == "4bit" and not self.hardware["cuda_available"] else None
            )
            
            logger.info("AirLLM model loaded")
            
        except ImportError:
            raise ImportError("airllm not installed. Install with: pip install airllm")
    
    async def _load_transformers(self, quantization: str):
        """Load model with HuggingFace Transformers"""
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            settings.MODEL_NAME,
            trust_remote_code=True
        )
        
        # Configure model loading
        kwargs = {
            "pretrained_model_name_or_path": settings.MODEL_NAME,
            "trust_remote_code": True,
            "low_cpu_mem_usage": True,
            "attn_implementation": "eager"  # Use eager attention to avoid flash-attention issues
        }
        
        # CRITICAL: BitsAndBytes quantization causes segfaults on CPU
        # Only use quantization on CUDA/GPU
        if self.hardware["cuda_available"]:
            # Add quantization config for GPU only
            if quantization == "4bit":
                kwargs["quantization_config"] = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )
            elif quantization == "8bit":
                kwargs["quantization_config"] = BitsAndBytesConfig(load_in_8bit=True)
            kwargs["device_map"] = "auto"
        else:
            # CPU mode: use float32 without quantization to avoid segfaults
            logger.warning("CPU mode: Disabling BitsAndBytes quantization to prevent segmentation faults")
            logger.warning("Model will use ~7-8GB RAM. If you have limited RAM, consider using GGUF models instead.")
            kwargs["dtype"] = torch.float32  # Use 'dtype' instead of deprecated 'torch_dtype'
            kwargs["device_map"] = None
        
        self.model = AutoModelForCausalLM.from_pretrained(**kwargs)
        
        # Move to device if not auto
        if not self.hardware["cuda_available"]:
            self.model = self.model.to("cpu")
        
        self.model.eval()
        logger.info(f"Transformers model loaded on {self.model.device}")
        logger.info(f"Model memory footprint: ~{self.model.get_memory_footprint() / 1e9:.2f} GB")
    
    def _download_gguf_model(self) -> str:
        """Download GGUF model from HuggingFace"""
        from huggingface_hub import hf_hub_download
        
        # Extract repo and filename
        # Format: "TheBloke/Mistral-7B-Instruct-v0.2-GGUF" or direct file
        model_file = None
        
        # Common GGUF file patterns
        quantization_files = {
            "4bit": ["Q4_K_M.gguf", "q4_k_m.gguf"],
            "8bit": ["Q8_0.gguf", "q8_0.gguf"],
        }
        
        quant = self.determine_quantization()
        for filename_pattern in quantization_files.get(quant, ["Q4_K_M.gguf"]):
            try:
                model_file = hf_hub_download(
                    repo_id=settings.MODEL_NAME,
                    filename=filename_pattern,
                    cache_dir=str(settings.CACHE_DIR)
                )
                break
            except Exception:
                continue
        
        if not model_file:
            raise FileNotFoundError(f"Could not find GGUF file for {settings.MODEL_NAME}")
        
        return model_file
    
    async def generate(self, prompt: str, max_tokens: int = None, temperature: float = None) -> str:
        """Generate response (non-streaming)"""
        if self.model is None:
            await self.load_model()
        
        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE
        
        if self.backend == "gguf":
            return await self._generate_gguf(prompt, max_tokens, temperature)
        elif self.backend == "vllm":
            return await self._generate_vllm(prompt, max_tokens, temperature)
        elif self.backend == "airllm":
            return await self._generate_airllm(prompt, max_tokens, temperature)
        else:
            return await self._generate_transformers(prompt, max_tokens, temperature)
    
    async def generate_stream(
        self, prompt: str, max_tokens: int = None, temperature: float = None
    ) -> AsyncGenerator[str, None]:
        """Generate response with proper token streaming"""
        if self.model is None:
            await self.load_model()
        
        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE
        
        if self.backend == "gguf":
            async for chunk in self._generate_gguf_stream(prompt, max_tokens, temperature):
                yield chunk
        elif self.backend == "vllm":
            async for chunk in self._generate_vllm_stream(prompt, max_tokens, temperature):
                yield chunk
        elif self.backend == "airllm":
            async for chunk in self._generate_airllm_stream(prompt, max_tokens, temperature):
                yield chunk
        else:
            async for chunk in self._generate_transformers_stream(prompt, max_tokens, temperature):
                yield chunk
    
    async def _generate_gguf(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate with GGUF model"""
        output = self.model(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stop=["</s>", "\n\n"]
        )
        return output["choices"][0]["text"]
    
    async def _generate_gguf_stream(self, prompt: str, max_tokens: int, temperature: float):
        """Stream tokens from GGUF model"""
        stream = self.model(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stream=True,
            stop=["</s>", "\n\n"]
        )
        
        for output in stream:
            yield output["choices"][0]["text"]
    
    async def _generate_vllm(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate with vLLM"""
        from vllm import SamplingParams
        
        sampling_params = SamplingParams(
            temperature=temperature,
            max_tokens=max_tokens,
            stop=["</s>"]
        )
        
        outputs = self.model.generate([prompt], sampling_params)
        return outputs[0].outputs[0].text
    
    async def _generate_vllm_stream(self, prompt: str, max_tokens: int, temperature: float):
        """Stream tokens from vLLM"""
        from vllm import SamplingParams
        
        sampling_params = SamplingParams(
            temperature=temperature,
            max_tokens=max_tokens,
            stop=["</s>"]
        )
        
        # vLLM streaming support
        for output in self.model.generate([prompt], sampling_params, use_tqdm=False):
            for token_output in output.outputs:
                yield token_output.text
    
    async def _generate_airllm(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate with AirLLM"""
        inputs = self.model.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            pad_token_id=self.model.tokenizer.eos_token_id,
            use_cache=False
        )
        return self.model.tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    async def _generate_airllm_stream(self, prompt: str, max_tokens: int, temperature: float):
        """Stream tokens from AirLLM using TextIteratorStreamer"""
        try:
            from transformers import TextIteratorStreamer
            from threading import Thread
            
            inputs = self.model.tokenizer(prompt, return_tensors="pt")
            streamer = TextIteratorStreamer(self.model.tokenizer, skip_special_tokens=True)
            
            generation_kwargs = dict(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.model.tokenizer.eos_token_id,
                streamer=streamer,
                use_cache=False
            )
            
            # Run generation in thread
            thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
            thread.start()
            
            # Stream tokens
            for text in streamer:
                yield text
            
            thread.join()
            
        except ImportError:
            # Fallback: simulate streaming
            response = await self._generate_airllm(prompt, max_tokens, temperature)
            words = response.split()
            for i in range(0, len(words), 3):
                yield " ".join(words[i:i+3]) + " "
    
    async def _generate_transformers(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate with Transformers"""
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        # Get the number of input tokens to skip them in the output
        input_length = inputs['input_ids'].shape[1]
        
        logger.info(f"Generating with prompt length: {input_length} tokens, max_new_tokens: {max_tokens}, device: {self.model.device}")
        
        # For CPU inference with quantization, reduce token count if needed
        if not self.hardware["cuda_available"] and max_tokens > 30:
            logger.info(f"CPU mode: Limiting tokens to 30 for faster generation")
            max_tokens = 30
        
        with torch.no_grad():
            # Use simpler generation parameters for better compatibility
            gen_kwargs = {
                **inputs,
                "max_new_tokens": max_tokens,
                "pad_token_id": self.tokenizer.eos_token_id,
                "eos_token_id": self.tokenizer.eos_token_id,
            }
            
            # Try to use static cache for better performance while avoiding DynamicCache issues
            try:
                from transformers import StaticCache
                # Create a static cache to avoid DynamicCache compatibility issues
                # but still get performance benefits
                past_key_values = StaticCache(
                    config=self.model.config,
                    max_batch_size=1,
                    max_cache_len=input_length + max_tokens,
                    device=self.model.device,
                    dtype=self.model.dtype
                )
                gen_kwargs["past_key_values"] = past_key_values
                gen_kwargs["use_cache"] = True
                logger.info("Using StaticCache for better performance")
            except (ImportError, Exception) as e:
                # Fallback to no cache if StaticCache not available
                gen_kwargs["use_cache"] = False
                logger.warning(f"StaticCache not available, using no cache: {e}")
            
            # Only add sampling if temperature > 0
            if temperature > 0:
                gen_kwargs["do_sample"] = True
                gen_kwargs["temperature"] = temperature
                gen_kwargs["top_p"] = 0.9
            else:
                gen_kwargs["do_sample"] = False
            
            logger.info("Starting generation...")
            outputs = self.model.generate(**gen_kwargs)
            logger.info("Generation complete")
        
        # Decode only the generated tokens (skip the input prompt)
        generated_tokens = outputs[0][input_length:]
        logger.info(f"Generated {len(generated_tokens)} tokens")
        
        response = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
        logger.info(f"Decoded response length: {len(response)} chars")
        
        return response.strip()
    
    async def _generate_transformers_stream(self, prompt: str, max_tokens: int, temperature: float):
        """Stream tokens from Transformers using TextIteratorStreamer"""
        from transformers import TextIteratorStreamer
        from threading import Thread
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        streamer = TextIteratorStreamer(self.tokenizer, skip_special_tokens=True, skip_prompt=True)
        
        generation_kwargs = dict(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
            streamer=streamer,
            use_cache=False  # Disable cache to avoid DynamicCache compatibility issues
        )
        
        # Run generation in thread
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()
        
        # Stream tokens
        for text in streamer:
            yield text
        
        thread.join()
    
    def unload_model(self):
        """Unload model and free memory"""
        if self.model is not None:
            del self.model
            del self.tokenizer
            self.model = None
            self.tokenizer = None
            
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            logger.info("Model unloaded and cache cleared")


# Global instance
model_loader = ModelLoader()
