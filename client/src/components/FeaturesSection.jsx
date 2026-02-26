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
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 xl:px-16 section-gradient" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed px-4">
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
              className="glass-panel p-6 sm:p-8 lg:p-10 rounded-xl lg:rounded-2xl cursor-pointer group relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className={`p-3 sm:p-4 rounded-lg lg:rounded-xl bg-gradient-to-br ${feature.gradient} 
                                group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-1 sm:mb-2">{feature.title}</h3>
                    <span className="text-xs sm:text-sm text-accent-cyan font-medium">{feature.subtitle}</span>
                  </div>
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain opacity-50 group-hover:opacity-100 
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
          className="glass-panel p-12 rounded-3xl border border-white/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Experience <span className="gradient-text">intelligent research</span>
              </h3>
              <p className="text-lg text-neutral-300 leading-relaxed">
                EdgeScholar AI helps researchers analyze documents, 
                extract insights, and accelerate their research workflow all 
                while keeping data completely private on your AMD-powered device.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/chat')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Try it yourself
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            <div className="relative">
              <div className="glass-panel p-8 rounded-2xl border border-white/20 shadow-2xl bg-gradient-to-br from-accent-blue/5 to-accent-green/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-6 bg-white/5 rounded-xl border border-accent-blue/30">
                      <img src="/images/documentation.png" alt="Upload" className="w-full h-24 object-contain mb-3" />
                      <p className="text-xs text-center text-neutral-400">Upload Documents</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl border border-accent-green/30">
                      <img src="/images/switch.png" alt="Process" className="w-full h-24 object-contain mb-3" />
                      <p className="text-xs text-center text-neutral-400">Fast Processing</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 bg-white/5 rounded-xl border border-accent-cyan/30">
                      <img src="/images/seo.png" alt="Analyze" className="w-full h-24 object-contain mb-3" />
                      <p className="text-xs text-center text-neutral-400">Deep Analysis</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl border border-accent-green/30">
                      <img src="/images/stamp.png" alt="Secure" className="w-full h-24 object-contain mb-3" />
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