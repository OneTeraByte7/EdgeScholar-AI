import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 pb-12 sm:pb-16 section-gradient">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text Content */}
          <div className="space-y-5 sm:space-y-6">
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
                className="inline-block px-3 py-1.5 bg-accent-blue/10 border border-accent-blue/30 
                         rounded-full text-xs font-medium text-accent-blue mb-3"
              >
                <Sparkles className="w-3 h-3 inline mr-1.5" />
                Powered by AMD ROCm
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight mb-3 sm:mb-4">
                <span className="block mb-1 sm:mb-2">Research insights,</span>
                <span className="block gradient-text">privately yours</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm sm:text-base lg:text-lg text-neutral-200 max-w-xl font-light leading-relaxed"
              >
                Chat with your research papers, extract insights, and accelerate
                your work all processed locally on your device with zero data
                sent to the cloud.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="btn-primary flex items-center justify-center gap-2 text-sm px-6 py-2.5 group"
              >
                Start Chatting
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="btn-secondary flex items-center justify-center gap-2 text-sm px-6 py-2.5"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                See Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs text-neutral-400">100% On-device</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                <span className="text-xs text-neutral-400">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs text-neutral-400">Open Source</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative glass-panel p-5 sm:p-6 rounded-2xl border-2 border-white/20 shadow-2xl">
              {/* Illustration Grid */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-4 rounded-xl bg-gradient-to-br from-accent-blue/10 to-transparent"
                >
                  <img src="/images/documentation.png" alt="Documentation" className="w-full h-18 object-contain mb-2" />
                  <p className="text-xs text-center text-neutral-400">Smart Analysis</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-4 rounded-xl bg-gradient-to-br from-accent-green/10 to-transparent"
                >
                  <img src="/images/stamp.png" alt="Private" className="w-full h-18 object-contain mb-2" />
                  <p className="text-xs text-center text-neutral-400">100% Private</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-4 rounded-xl bg-gradient-to-br from-accent-cyan/10 to-transparent"
                >
                  <img src="/images/switch.png" alt="Fast" className="w-full h-18 object-contain mb-2" />
                  <p className="text-xs text-center text-neutral-400">Lightning Fast</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-panel p-4 rounded-xl bg-gradient-to-br from-accent-green/10 to-transparent"
                >
                  <img src="/images/seo.png" alt="Smart" className="w-full h-18 object-contain mb-2" />
                  <p className="text-xs text-center text-neutral-400">AI Powered</p>
                </motion.div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 bg-accent-green text-black px-3 py-1.5 
                         rounded-full font-bold text-xs shadow-xl z-10"
              >
                70B Model
              </motion.div>

              {/* Security Badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-3 -left-3 glass-panel p-2.5 rounded-lg border border-accent-blue/40 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <img src="/images/stamp.png" alt="Secure" className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold text-accent-blue">100% Private</div>
                    <div className="text-[10px] text-neutral-400">Zero data sent</div>
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