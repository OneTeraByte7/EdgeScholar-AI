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
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
            The power of <span className="gradient-text">on-device AI</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed px-4">
            Real-world impact from researchers who prioritize privacy and performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="metric-card group"
            >
              <div className="mb-3">
                <metric.icon className={`w-8 h-8 sm:w-9 sm:h-9 ${metric.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-3xl sm:text-4xl font-display font-bold mb-2 gradient-text">
                {metric.value}
              </div>
              <div className="text-neutral-300 text-sm leading-relaxed">
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