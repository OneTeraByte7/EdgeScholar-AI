import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center px-8 lg:px-16 pt-32 pb-20 section-gradient">
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text Content */}
          <div className="space-y-10">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-block px-4 py-2 bg-accent-blue/10 border border-accent-blue/30 
                         rounded-full text-sm font-medium text-accent-blue mb-6"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Powered by AMD ROCm
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight mb-8">
                <span className="block mb-2">Research insights,</span>
                <span className="block gradient-text">privately yours</span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-neutral-200 max-w-2xl font-light leading-relaxed"
              >
                Chat with your research papers, extract insights, and accelerate
                your work—all processed locally on your device with zero data
                sent to the cloud.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="btn-primary flex items-center justify-center gap-3 text-lg px-10 py-4 group"
              >
                Start Chatting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="btn-secondary flex items-center justify-center gap-3 text-lg px-10 py-4"
              >
                <Sparkles className="w-5 h-5" />
                See Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center gap-8 pt-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse" />
                <span className="text-sm text-neutral-400">100% On-device</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent-blue animate-pulse" />
                <span className="text-sm text-neutral-400">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-sm text-neutral-400">Open Source</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative"
          >
            <div className="relative glass-panel p-12 rounded-3xl border-2 border-white/20 shadow-2xl">
              {/* Illustration Grid */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-transparent"
                >
                  <img src="/images/documentation.png" alt="Documentation" className="w-full h-32 object-contain mb-4" />
                  <p className="text-sm text-center text-neutral-400">Smart Analysis</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-accent-green/10 to-transparent"
                >
                  <img src="/images/stamp.png" alt="Private" className="w-full h-32 object-contain mb-4" />
                  <p className="text-sm text-center text-neutral-400">100% Private</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-accent-cyan/10 to-transparent"
                >
                  <img src="/images/switch.png" alt="Fast" className="w-full h-32 object-contain mb-4" />
                  <p className="text-sm text-center text-neutral-400">Lightning Fast</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-accent-green/10 to-transparent"
                >
                  <img src="/images/seo.png" alt="Smart" className="w-full h-32 object-contain mb-4" />
                  <p className="text-sm text-center text-neutral-400">AI Powered</p>
                </motion.div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-accent-green text-black px-6 py-3 
                         rounded-full font-bold shadow-xl z-10"
              >
                70B Model
              </motion.div>

              {/* Security Badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-panel p-4 rounded-xl border border-accent-blue/40 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <img src="/images/stamp.png" alt="Secure" className="w-8 h-8" />
                  <div>
                    <div className="text-sm font-bold text-accent-blue">100% Private</div>
                    <div className="text-xs text-neutral-400">Zero data sent</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection