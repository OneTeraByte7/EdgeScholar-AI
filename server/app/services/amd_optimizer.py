"""
AMD Hardware Optimizer - ROCm Acceleration & Monitoring
Showcases AMD GPU capabilities for Slingshot Hackathon
"""
import logging
import psutil
import platform
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class AMDHardwareOptimizer:
    """
    AMD Hardware Detection and Optimization Service
    
    Features:
    - Real-time AMD GPU detection
    - ROCm availability checking
    - Performance monitoring
    - Hardware-specific optimizations
    """
    
    def __init__(self):
        self.system_info = self._detect_hardware()
        self.is_amd_gpu = self._detect_amd_gpu()
        self.rocm_available = self._check_rocm()
        
    def _detect_hardware(self) -> Dict:
        """Detect system hardware specifications"""
        try:
            return {
                "cpu_model": platform.processor(),
                "cpu_cores": psutil.cpu_count(logical=False),
                "cpu_threads": psutil.cpu_count(logical=True),
                "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                "ram_available_gb": round(psutil.virtual_memory().available / (1024**3), 2),
                "platform": platform.system(),
                "platform_version": platform.version(),
            }
        except Exception as e:
            logger.error(f"Hardware detection error: {e}")
            return {}
    
    def _detect_amd_gpu(self) -> bool:
        """Detect if AMD GPU is present"""
        try:
            # Try to detect AMD GPU
            import subprocess
            
            # Check for AMD GPU on Linux
            if platform.system() == "Linux":
                result = subprocess.run(
                    ["lspci | grep -i 'vga\\|3d\\|display'"],
                    shell=True,
                    capture_output=True,
                    text=True
                )
                return "AMD" in result.stdout or "Radeon" in result.stdout
            
            # Check for AMD GPU on Windows
            elif platform.system() == "Windows":
                result = subprocess.run(
                    ["wmic path win32_VideoController get name"],
                    shell=True,
                    capture_output=True,
                    text=True
                )
                return "AMD" in result.stdout or "Radeon" in result.stdout
            
            return False
        except Exception as e:
            logger.warning(f"AMD GPU detection failed: {e}")
            return False
    
    def _check_rocm(self) -> bool:
        """Check if ROCm is available"""
        try:
            import torch
            return torch.cuda.is_available() and hasattr(torch.version, 'hip')
        except:
            return False
    
    def get_hardware_status(self) -> Dict:
        """Get current hardware status and utilization"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            status = {
                "timestamp": datetime.now().isoformat(),
                "cpu_usage_percent": cpu_percent,
                "ram_used_gb": round((memory.total - memory.available) / (1024**3), 2),
                "ram_usage_percent": memory.percent,
                "amd_gpu_detected": self.is_amd_gpu,
                "rocm_available": self.rocm_available,
                "optimization_level": self._get_optimization_level(),
                **self.system_info
            }
            
            return status
        except Exception as e:
            logger.error(f"Status check error: {e}")
            return {}
    
    def _get_optimization_level(self) -> str:
        """Determine optimization level based on hardware"""
        if self.rocm_available:
            return "AMD ROCm GPU Acceleration ⚡"
        elif self.is_amd_gpu:
            return "AMD GPU Detected (CPU Mode) 🎯"
        else:
            return "CPU Optimized ⚙️"
    
    def get_recommendations(self) -> Dict:
        """Get AMD hardware optimization recommendations"""
        recommendations = []
        
        if self.is_amd_gpu and not self.rocm_available:
            recommendations.append({
                "title": "Install ROCm for GPU Acceleration",
                "description": "AMD GPU detected but ROCm not installed. Install ROCm for 10-50x performance boost.",
                "priority": "high",
                "link": "https://rocmdocs.amd.com/en/latest/Installation_Guide/Installation-Guide.html"
            })
        
        ram_available = self.system_info.get("ram_available_gb", 0)
        if ram_available < 8:
            recommendations.append({
                "title": "Low Memory Warning",
                "description": f"Only {ram_available}GB RAM available. Consider closing other applications.",
                "priority": "medium"
            })
        
        if self.system_info.get("cpu_cores", 0) < 4:
            recommendations.append({
                "title": "Limited CPU Cores",
                "description": "Model inference may be slower. Consider using quantized models.",
                "priority": "low"
            })
        
        return {
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    
    def get_amd_showcase_info(self) -> Dict:
        """
        Get AMD-specific information for hackathon showcase
        Highlights AMD hardware capabilities
        """
        return {
            "amd_powered": self.is_amd_gpu or "AMD" in self.system_info.get("cpu_model", ""),
            "rocm_enabled": self.rocm_available,
            "hardware_tier": self._determine_hardware_tier(),
            "performance_estimate": self._estimate_performance(),
            "amd_advantages": [
                "✅ On-device processing - No cloud dependency",
                "✅ Privacy-first - Data never leaves your machine",
                "✅ Cost-effective - No API costs",
                "✅ ROCm acceleration - Up to 50x faster than CPU",
                "✅ Open-source ecosystem - Community-driven"
            ]
        }
    
    def _determine_hardware_tier(self) -> str:
        """Determine hardware capability tier"""
        if self.rocm_available:
            return "🔥 Elite (AMD GPU + ROCm)"
        elif self.is_amd_gpu:
            return "⚡ High (AMD GPU)"
        elif self.system_info.get("cpu_cores", 0) >= 8:
            return "💪 Medium (Multi-core CPU)"
        else:
            return "⚙️ Basic (Standard CPU)"
    
    def _estimate_performance(self) -> str:
        """Estimate inference performance"""
        if self.rocm_available:
            return "~20-50 tokens/sec (GPU accelerated)"
        elif self.system_info.get("cpu_threads", 0) >= 16:
            return "~5-15 tokens/sec (High-end CPU)"
        elif self.system_info.get("cpu_threads", 0) >= 8:
            return "~3-8 tokens/sec (Mid-range CPU)"
        else:
            return "~1-3 tokens/sec (Entry-level CPU)"


# Global instance
amd_optimizer = AMDHardwareOptimizer()
