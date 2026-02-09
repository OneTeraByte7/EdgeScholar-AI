"""
Quick test script for the new model loader
Tests hardware detection, model loading, and streaming
"""
import asyncio
import sys
from pathlib import Path

# Add server to path
sys.path.insert(0, str(Path(__file__).parent / "server"))

from app.services.llm_service import llm_service
from app.services.model_loader import HardwareDetector


async def main():
    print("=" * 70)
    print("EdgeScholarAI - Model Loader Test")
    print("=" * 70)
    
    # Test hardware detection
    print("\n1. Hardware Detection:")
    print("-" * 70)
    hardware = HardwareDetector.detect()
    print(f"   CPU Cores: {hardware['cpu_cores']}")
    print(f"   Total RAM: {hardware['ram_gb']:.1f} GB")
    print(f"   Available RAM: {hardware['available_ram_gb']:.1f} GB")
    print(f"   CUDA Available: {hardware['cuda_available']}")
    if hardware['cuda_available']:
        print(f"   GPU Memory: {hardware['gpu_memory_gb']:.1f} GB")
    print(f"   Recommended Backend: {hardware['recommended_backend']}")
    print(f"   Recommended Quantization: {hardware['recommended_quantization']}")
    
    # Test model loading
    print("\n2. Loading Model:")
    print("-" * 70)
    try:
        await llm_service.load_model()
        config = llm_service.get_model_info()
        print(f"   ✅ Model loaded successfully!")
        print(f"   Backend: {config.get('backend', 'Unknown')}")
        print(f"   Quantization: {config.get('quantization', 'Unknown')}")
        print(f"   Model: {config.get('model_name', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ Model loading failed: {e}")
        print("\n   Troubleshooting:")
        print("   - Check your internet connection (for model download)")
        print("   - Verify you have enough disk space (~3-5GB needed)")
        print("   - Try setting MODEL_TYPE=transformers in .env")
        return
    
    # Test non-streaming generation
    print("\n3. Non-Streaming Generation Test:")
    print("-" * 70)
    try:
        prompt = "What is machine learning in one sentence?"
        print(f"   Prompt: {prompt}")
        print(f"   Response: ", end='', flush=True)
        response = await llm_service.generate(prompt, max_tokens=50)
        print(response)
    except Exception as e:
        print(f"\n   ⚠️  Generation failed: {e}")
    
    # Test streaming generation
    print("\n4. Streaming Generation Test:")
    print("-" * 70)
    try:
        prompt = "Count from 1 to 5:"
        print(f"   Prompt: {prompt}")
        print(f"   Response: ", end='', flush=True)
        async for token in llm_service.generate_stream(prompt, max_tokens=30):
            print(token, end='', flush=True)
        print()
    except Exception as e:
        print(f"\n   ⚠️  Streaming failed: {e}")
    
    # Summary
    print("\n" + "=" * 70)
    print("Test Complete!")
    print("=" * 70)
    print("\nIf you see ✅ for model loading, you're all set!")
    print("Check UPGRADE_SUMMARY.md for configuration options.")
    print("Check MODEL_CONFIGURATION.md for detailed model guides.")
    

if __name__ == "__main__":
    asyncio.run(main())
