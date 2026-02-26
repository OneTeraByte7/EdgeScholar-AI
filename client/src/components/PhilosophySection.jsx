import { motion } from 'framer-motion'
import { Target, Globe, TrendingUp } from 'lucide-react'

const PhilosophySection = () => {
  const principles = [
    {
      icon: Target,
      title: 'Privacy First',
      description: 'Your research stays yours. All processing happens on your device with AMD ROCm acceleration—no cloud, no data leaks, no compromises.',
      image: '/images/stamp.png'
    },
    {
      icon: Globe,
      title: 'Open & Transparent',
      description: 'Built on open-source technology. Inspect our code, contribute improvements, and trust the system you use every day.',
      image: '/images/seo.png'
    },
    {
      icon: TrendingUp,
      title: 'Performance Matters',
      description: 'Powered by AMD GPUs for lightning-fast inference. Process 70B parameter models locally without sacrificing speed.',
      image: '/images/switch.png'
    }
  ]

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 xl:py-40 px-4 sm:px-6 lg:px-12 xl:px-16 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight px-4">
            Built for researchers,
            <br />
            <span className="gradient-text">by researchers</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed px-4">
            Our core principles guide everything we build
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="glass-panel p-10 rounded-2xl h-full hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                {/* Background image */}
                <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img src={principle.image} alt={principle.title} className="w-24 h-24 object-contain" />
                </div>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-green/20 
                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                      <principle.icon className="w-8 h-8 text-accent-cyan" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 text-white">
                    {principle.title}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed text-base">
                    {principle.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PhilosophySection