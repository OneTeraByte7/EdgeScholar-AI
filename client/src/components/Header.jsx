import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    { name: 'Product', href: '#features' },
    { name: 'AMD Showcase', href: '/amd-showcase' },
    { name: 'About', href: '#about' },
  ]

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/images/1.png" alt="Vigor AI" className="h-8 sm:h-10 w-auto" />
          <span className="text-xl sm:text-2xl font-display font-bold gradient-text">Vigor</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileHover={{ scale: 1.05 }}
              className="text-sm lg:text-base text-neutral-200 hover:text-accent-cyan transition-colors duration-300"
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="btn-primary text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3"
          >
            Try Chat
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-panel border-t border-white/10"
        >
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-neutral-200 hover:text-accent-cyan transition-colors"
              >
                {item.name}
              </a>
            ))}
            <button 
              onClick={() => navigate('/chat')}
              className="btn-primary w-full"
            >
              Try Chat
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

export default Header