import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CTASection = () => {
  const navigate = useNavigate()

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative glass-panel p-8 sm:p-10 lg:p-14 rounded-2xl overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 animated-gradient opacity-10" />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 leading-tight px-4">
                Ready to revolutionize
                <br />
                <span className="gradient-text">your research workflow?</span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                Join thousands of researchers using Vigor AI to accelerate their work without compromising privacy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="btn-primary flex items-center gap-2 text-sm px-5 sm:px-7 py-2.5 sm:py-3 group w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                Try Chat Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat')}
                className="text-accent-cyan hover:text-accent-blue transition-colors font-medium flex items-center gap-2"
              >
                View demo
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-400"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span>100% On-device</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span>Open Source</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection