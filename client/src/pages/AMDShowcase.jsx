import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Cpu, 
  Zap, 
  Activity, 
  HardDrive, 
  BarChart3,
  TrendingUp,
  FileText,
  Brain,
  Search,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react'

const AMDShowcase = () => {
  const [hardwareStatus, setHardwareStatus] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAMDShowcase()
    // Refresh every 5 seconds
    const interval = setInterval(fetchAMDShowcase, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAMDShowcase = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/amd/showcase')
      const data = await response.json()
      
      if (data.status === 'success') {
        setHardwareStatus(data.amd_integration)
        setAnalytics(data.research_intelligence)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch AMD showcase:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-white">Loading AMD Showcase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary py-20">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            AMD AI Showcase
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Real-time hardware monitoring and advanced research intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hardware Status Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <Cpu className="w-6 h-6 text-accent-blue" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Hardware Status
              </h2>
            </div>

            {hardwareStatus && (
              <div className="space-y-6">
                {/* Hardware Tier */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Hardware Tier</span>
                    <Zap className="w-5 h-5 text-accent-green" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {hardwareStatus.amd_showcase?.hardware_tier || 'Unknown'}
                  </p>
                </div>

                {/* Performance */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Performance</span>
                    <Activity className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {hardwareStatus.performance || 'N/A'}
                  </p>
                </div>

                {/* System Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">CPU Usage</span>
                    <span className="text-sm font-semibold text-white">
                      {hardwareStatus.hardware_detection?.cpu_usage_percent?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-500"
                      style={{ width: `${hardwareStatus.hardware_detection?.cpu_usage_percent || 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-neutral-400">RAM Usage</span>
                    <span className="text-sm font-semibold text-white">
                      {hardwareStatus.hardware_detection?.ram_usage_percent?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full transition-all duration-500"
                      style={{ width: `${hardwareStatus.hardware_detection?.ram_usage_percent || 0}%` }}
                    />
                  </div>
                </div>

                {/* AMD GPU Status */}
                <div className="p-4 bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {hardwareStatus.hardware_detection?.amd_gpu_detected ? (
                      <CheckCircle className="w-5 h-5 text-accent-green" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-sm font-semibold text-white">AMD GPU</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {hardwareStatus.hardware_detection?.amd_gpu_detected 
                      ? 'Detected and Ready' 
                      : 'Not Detected (CPU Mode)'}
                  </p>
                </div>

                {/* ROCm Status */}
                <div className="p-4 bg-gradient-to-br from-accent-green/10 to-accent-cyan/10 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {hardwareStatus.hardware_detection?.rocm_available ? (
                      <CheckCircle className="w-5 h-5 text-accent-green" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-sm font-semibold text-white">ROCm</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {hardwareStatus.hardware_detection?.rocm_available 
                      ? 'Enabled - GPU Acceleration Active' 
                      : 'Not Available'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Research Analytics Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent-green/20 rounded-xl">
                <Brain className="w-6 h-6 text-accent-green" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Research Intelligence
              </h2>
            </div>

            {analytics && (
              <div className="space-y-6">
                {/* Corpus Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <FileText className="w-5 h-5 text-accent-blue mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {analytics.corpus_stats?.unique_papers || 0}
                    </p>
                    <p className="text-xs text-neutral-400">Papers Analyzed</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <BarChart3 className="w-5 h-5 text-accent-green mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {analytics.corpus_stats?.total_chunks || 0}
                    </p>
                    <p className="text-xs text-neutral-400">Document Chunks</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-cyan" />
                    Advanced Features
                  </h3>
                  {analytics.features?.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Analytics Available */}
                <div className="p-4 bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-accent-cyan" />
                    <span className="text-sm font-semibold text-white">Analytics Engine</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {analytics.analytics_available 
                      ? '✅ Active - Real-time document intelligence' 
                      : 'Upload documents to activate'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* AMD Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-display font-bold text-white mb-6 text-center">
            AMD-Powered Advantages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hardwareStatus?.amd_showcase?.amd_advantages?.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-panel p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-accent-cyan" />
                </div>
                <p className="text-sm text-neutral-300">{advantage}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gradient-to-r from-accent-blue to-accent-green text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-accent-blue/40 transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default AMDShowcase
