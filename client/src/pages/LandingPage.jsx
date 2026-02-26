import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Lock, 
  Cpu, 
  Zap, 
  BarChart3, 
  FileText, 
  MessageSquare,
  ArrowRight,
  Shield,
  Database,
  Gauge
} from 'lucide-react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import MetricsSection from '../components/MetricsSection'
import FeaturesSection from '../components/FeaturesSection'
import PhilosophySection from '../components/PhilosophySection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/images/pexels-pixabay-159740.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
      </div>

      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <PhilosophySection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage