import { motion } from 'framer-motion'
import { BookOpen, FileText, MessageSquare, BarChart3, Cpu, Lock } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Track',
      subtitle: 'Smart Literature Review',
      description: 'Emissions, energy, and waste across your value chain',
      gradient: 'from-accent-blue/20 to-accent-cyan/10'
    },
    {
      icon: BarChart3,
      title: 'Model',
      subtitle: 'Document Analysis',
      description: 'Forecast performance and goal alignment',
      gradient: 'from-accent-green/20 to-accent-blue/10'
    },
    {
      icon: FileText,
      title: 'Report',
      subtitle: 'Citation Manager',
      description: 'Generate ESG disclosures, automate frameworks',
      gradient: 'from-accent-cyan/20 to-accent-green/10'
    },
    {
      icon: Cpu,
      title: 'Act',
      subtitle: 'AMD-Powered AI',
      description: 'Surface insights and opportunities, next steps',
      gradient: 'from-accent-green/20 to-accent-cyan/10'
    }
  ]

  return (
    <section className="py-24 px-6 section-gradient" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-panel p-8 rounded-3xl">
              <div className="mb-6">
                <div className="text-sm text-accent-cyan mb-2">Energy consumption</div>
                <div className="text-6xl font-display font-bold gradient-text">
                  583.7
                </div>
                <div className="text-sm text-neutral-400">kWh</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-accent-green" />
                    </div>
                    <div>
                      <div className="font-medium">100% Private</div>
                      <div className="text-xs text-neutral-400">On-device processing</div>
                    </div>
                  </div>
                  <div className="text-accent-green font-mono text-sm">✓</div>
                </div>

                <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                      <div className="font-medium">AMD ROCm</div>
                      <div className="text-xs text-neutral-400">GPU acceleration</div>
                    </div>
                  </div>
                  <div className="text-accent-blue font-mono text-sm">Active</div>
                </div>

                <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div>
                      <div className="font-medium">RAG Pipeline</div>
                      <div className="text-xs text-neutral-400">Citation-backed answers</div>
                    </div>
                  </div>
                  <div className="text-accent-cyan font-mono text-sm">Ready</div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-accent-green text-black px-6 py-3 rounded-full font-bold shadow-lg"
            >
              70B Model
            </motion.div>
          </motion.div>

          {/* Right side - Features */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-panel p-6 rounded-2xl cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-display font-bold">{feature.title}</h3>
                      <span className="text-sm text-neutral-400">{feature.subtitle}</span>
                    </div>
                    <p className="text-neutral-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full mt-6"
            >
              Explore features →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection