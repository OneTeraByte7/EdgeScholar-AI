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
    print(f"   CPU Cores: {hardware.get('cpu_cores', 'Unknown')}")
    print(f"   Total RAM: {hardware.get('ram_gb', 0):.1f} GB")
    print(f"   Available RAM: {hardware.get('available_ram_gb', 0):.1f} GB")
    print(f"   CUDA Available: {hardware.get('cuda_available', False)}")
    if hardware.get('cuda_available'):
        print(f"   GPU Memory: {hardware.get('gpu_memory_gb', 0):.1f} GB")
    print(f"   Recommended Backend: {hardware.get('recommended_backend', 'Unknown')}")
    print(f"   Recommended Quantization: {hardware.get('recommended_quantization', 'Unknown')}")
    
    # Test model loading
    print("\n2. Loading Model:")
    print("-" * 70)
    try:
        await llm_service.load_model()
        config = llm_service.get_model_info()
        print(f"   ✅ Model loaded successfully!")
        print(f"   Backend: {config.get('backend', 'Unknown')}")
        print(f"   Quantization: {config.get('quantization', 'Unknown')}")
        model_name = config.get('model_name', 'Unknown')
        if len(model_name) > 50:
            model_name = model_name[:50] + "..."
        print(f"   Model: {model_name}")
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
        print(f"   Generating (may take 30-90 seconds on CPU with 4-bit quantization)...", flush=True)
        
        import warnings
        import sys
        import io
        import asyncio
        
        # Capture stdout to avoid model warnings
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                # Add timeout to avoid hanging forever - use fewer tokens for CPU
                response = await asyncio.wait_for(
                    llm_service.generate(prompt, max_tokens=30, temperature=0.7),
                    timeout=180.0  # 3 minutes timeout
                )
        except asyncio.TimeoutError:
            sys.stdout = old_stdout
            print(f"   ⚠️  Generation timed out after 3 minutes")
            print(f"   This might indicate an issue with the model or generation parameters")
            return
        finally:
            # Restore stdout
            captured_output = sys.stdout.getvalue()
            sys.stdout = old_stdout
        
        print(f"   Response: {response}")
        print(f"   Length: {len(response)} characters")
        
        if not response or len(response.strip()) < 5:
            print(f"   ⚠️  Warning: Response seems too short or empty")
            if captured_output:
                print(f"   Debug - Captured output: {captured_output[:200]}")
            
    except Exception as e:
        if 'old_stdout' in locals():
            sys.stdout = old_stdout  # Make sure to restore stdout
        print(f"   ⚠️  Generation failed: {e}")
        import traceback
        traceback.print_exc()
    
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
