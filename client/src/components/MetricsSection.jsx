import { motion } from 'framer-motion'
import { TrendingUp, Users, Zap, Shield } from 'lucide-react'

const MetricsSection = () => {
  const metrics = [
    {
      icon: TrendingUp,
      value: '78%',
      label: 'Researchers avoid cloud AI',
      color: 'text-accent-cyan'
    },
    {
      icon: Zap,
      value: '15hrs',
      label: 'Saved per week',
      color: 'text-accent-green'
    },
    {
      icon: Users,
      value: '3.5M',
      label: 'Graduate students globally',
      color: 'text-accent-blue'
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Privacy guaranteed',
      color: 'text-accent-green'
    }
  ]

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 xl:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6 lg:mb-8">
            The power of <span className="gradient-text">on-device AI</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed px-4">
            Real-world impact from researchers who prioritize privacy and performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="metric-card group"
            >
              <div className="mb-4 sm:mb-6">
                <metric.icon className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${metric.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 gradient-text">
                {metric.value}
              </div>
              <div className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MetricsSection