"""
IMMEDIATE FIX - Downloads GGUF model right now
Run this BEFORE starting the server
"""
import os
import sys
from pathlib import Path

def main():
    print("\n" + "="*70)
    print("DOWNLOADING GGUF MODEL")
    print("="*70)
    
    # Set up environment
    os.environ['HF_HUB_DISABLE_SYMLINKS'] = '1'
    
    # Create directory
    models_dir = Path("server/app/models/downloaded")
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📁 Models directory: {models_dir.absolute()}")
    
    # Check if already exists
    gguf_file = models_dir / "Phi-3-mini-4k-instruct-q4.gguf"
    if gguf_file.exists():
        print(f"\n✅ GGUF model already exists!")
        print(f"   Location: {gguf_file}")
        print(f"   Size: {gguf_file.stat().st_size / 1e9:.2f} GB")
        print("\n✅ You can start the server now!")
        return
    
    print("\n📥 Downloading Phi-3-mini GGUF (Q4_K_M)...")
    print("   Size: ~2.4 GB")
    print("   Time: 5-15 minutes depending on internet speed")
    print("\n⏳ Please wait...\n")
    
    try:
        from huggingface_hub import hf_hub_download
        
        # Download with progress
        model_file = hf_hub_download(
            repo_id="microsoft/Phi-3-mini-4k-instruct-gguf",
            filename="Phi-3-mini-4k-instruct-q4.gguf",
            local_dir=str(models_dir),
            local_dir_use_symlinks=False,
            resume_download=True
        )
        
        print(f"\n✅ Download complete!")
        print(f"   Saved to: {model_file}")
        
        # Verify file
        file_size = Path(model_file).stat().st_size / 1e9
        print(f"   Size: {file_size:.2f} GB")
        
        if file_size < 2.0:
            print("\n⚠️  Warning: File seems too small, download may be incomplete")
            return
        
        print("\n" + "="*70)
        print("✅ SUCCESS! Model is ready!")
        print("="*70)
        
        print("\n🚀 Now start your server:")
        print("   cd server")
        print("   python -m app.main")
        
        print("\n⏱️  Model will load in ~30 seconds")
        print("✅ Chat will work!")
        
    except ImportError:
        print("\n❌ Error: huggingface_hub not installed")
        print("\nInstall it:")
        print("   pip install huggingface_hub")
        
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        print("\n📝 Manual download instructions:")
        print("   1. Go to: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/tree/main")
        print("   2. Download: Phi-3-mini-4k-instruct-q4.gguf (2.4 GB)")
        print(f"   3. Save to: {models_dir.absolute()}")

if __name__ == "__main__":
    main()
