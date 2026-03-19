import { motion } from 'framer-motion'
import { BookOpen, FileText, MessageSquare, BarChart3, Cpu, Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FeaturesSection = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Upload',
      subtitle: 'Multi-format Support',
      description: 'Upload PDFs, research papers, and documents. Our AI understands academic content and scientific literature.',
      gradient: 'from-accent-blue/20 to-accent-cyan/10',
      image: '/images/documentation.png'
    },
    {
      icon: BarChart3,
      title: 'Deep Analysis',
      subtitle: 'Intelligent Insights',
      description: 'Extract key findings, methodologies, and citations. Get comprehensive summaries and comparisons.',
      gradient: 'from-accent-green/20 to-accent-blue/10',
      image: '/images/seo.png'
    },
    {
      icon: MessageSquare,
      title: 'Natural Chat',
      subtitle: 'Conversational AI',
      description: 'Ask questions in plain language. Get citation-backed answers that reference specific sections.',
      gradient: 'from-accent-cyan/20 to-accent-green/10',
      image: '/images/switch.png'
    },
    {
      icon: Lock,
      title: '100% Private',
      subtitle: 'On-Device Processing',
      description: 'All processing happens locally on your AMD GPU. No data ever leaves your device.',
      gradient: 'from-accent-green/20 to-accent-cyan/10',
      image: '/images/stamp.png'
    }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 section-gradient" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed px-4">
            Everything you need for intelligent research assistance, all running privately on your device
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-panel p-5 sm:p-6 lg:p-7 rounded-xl cursor-pointer group relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${feature.gradient} 
                                group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-display font-bold mb-0.5">{feature.title}</h3>
                    <span className="text-xs sm:text-sm text-accent-cyan font-medium">{feature.subtitle}</span>
                  </div>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-50 group-hover:opacity-100 
                             transition-opacity duration-300"
                  />
                </div>
                <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-7 sm:p-8 rounded-2xl border border-white/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight">
                Experience <span className="gradient-text">intelligent research</span>
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Vigor AI helps researchers analyze documents,
                extract insights, and accelerate their research workflow all
                while keeping data completely private on your AMD-powered device.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/chat')}
                  className="btn-primary inline-flex items-center gap-2 text-sm"
                >
                  Try it yourself
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="relative">
              <div className="glass-panel p-5 rounded-2xl border border-white/20 shadow-2xl bg-gradient-to-br from-accent-blue/5 to-accent-green/5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-accent-blue/30">
                      <img src="/images/documentation.png" alt="Upload" className="w-full h-16 object-contain mb-2" />
                      <p className="text-xs text-center text-neutral-400">Upload Documents</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-accent-green/30">
                      <img src="/images/switch.png" alt="Process" className="w-full h-16 object-contain mb-2" />
                      <p className="text-xs text-center text-neutral-400">Fast Processing</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-accent-cyan/30">
                      <img src="/images/seo.png" alt="Analyze" className="w-full h-16 object-contain mb-2" />
                      <p className="text-xs text-center text-neutral-400">Deep Analysis</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-accent-green/30">
                      <img src="/images/stamp.png" alt="Secure" className="w-full h-16 object-contain mb-2" />
                      <p className="text-xs text-center text-neutral-400">100% Secure</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 
                            rounded-2xl blur-3xl -z-10 opacity-50" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection