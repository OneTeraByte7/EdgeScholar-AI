import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Documentation', 'Changelog']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press Kit']
    },
    {
      title: 'Resources',
      links: ['Community', 'Support', 'Status', 'GitHub']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security', 'Compliance']
    }
  ]

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' }
  ]

  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-3xl font-display font-bold gradient-text mb-4">
                PrivateScholar
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                Privacy-first research assistant powered by AMD. Your research, your device, your privacy.
              </p>
            </motion.div>

            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-neutral-400 hover:text-accent-cyan transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h4 className="font-display font-semibold mb-4 text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 2 }}
                      className="text-neutral-400 hover:text-accent-cyan transition-colors text-sm"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © 2025 PrivateScholar AI. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-neutral-400 hover:text-accent-cyan transition-colors"
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-neutral-400 hover:text-accent-cyan transition-colors"
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-neutral-400 hover:text-accent-cyan transition-colors"
            >
              Cookie Policy
            </motion.a>
          </div>
        </div>

        {/* AMD Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-white/10 text-center"
        >
          <div className="inline-flex items-center gap-3 glass-panel px-6 py-3 rounded-full">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-sm font-medium text-neutral-300">
              Powered by AMD ROCm
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer