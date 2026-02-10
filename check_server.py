"""
Check if the server is ready
"""
import requests
import time

def check_server():
    """Check if server is responding"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    print("Checking if EdgeScholarAI server is ready...\n")
    
    for i in range(10):
        if check_server():
            print("✅ SERVER IS READY!")
            print("\nYou can now:")
            print("  • Open http://localhost:8000 in your browser")
            print("  • Check API docs: http://localhost:8000/docs")
            print("  • Run tests: python test_quick.py")
            return
        
        print(f"⏳ Attempt {i+1}/10: Server not ready yet...")
        time.sleep(3)
    
    print("\n⚠️  Server is taking longer than expected.")
    print("\nCheck the terminal where you ran 'python -m app.main' for:")
    print("  • 'Loading checkpoint shards' progress")
    print("  • 'Application startup complete' message")
    print("\nModel loading can take 5-10 minutes on first run.")

if __name__ == "__main__":
    main()
