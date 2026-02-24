import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative glass-panel p-12 md:p-16 rounded-3xl overflow-hidden"
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
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Ready to revolutionize
                <br />
                <span className="gradient-text">your research workflow?</span>
              </h2>
              
              <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
                Join thousands of researchers using PrivateScholar AI to accelerate their work without compromising privacy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 group"
              >
                <Sparkles className="w-5 h-5" />
                Start free trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-400"
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