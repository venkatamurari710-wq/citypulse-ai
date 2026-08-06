// client/src/components/landing/Hero.jsx — Light & Professional Civic Style
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import SmartCityIllustration from './SmartCityIllustration';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24 bg-white">
      {/* Light subtle background radial glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[650px] h-[650px] bg-gradient-radial from-blue-100/40 via-emerald-50/20 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col items-start text-left"
          >
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1D4ED8] text-xs font-bold mb-6 shadow-xs cursor-default font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Powered by Google Gemini AI</span>
            </div>

            {/* Large Bold Heading — Space Grotesk */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-grotesk font-extrabold text-[#0F2C59] tracking-tight leading-[1.12] mb-6">
              Smarter Cities.<br />
              <span className="bg-gradient-to-r from-[#1D4ED8] via-[#1E3A8A] to-[#16A34A] bg-clip-text text-transparent">
                Faster Civic Resolutions.
              </span>
            </h1>

            {/* Description — Inter */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 max-w-xl font-sans">
              CityPulse AI transforms citizen complaints into actionable civic intelligence.
              Report issues in text, photos, videos, or voice — our AI handles classification and routing.
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto font-sans">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#1D4ED8] to-[#16A34A] hover:from-[#1E3A8A] hover:to-[#15803D] shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Get Started / Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-base text-[#0F2C59] bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <User className="w-4 h-4 text-slate-500" />
                Sign In to Platform
              </Link>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: AI Smart City Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 w-full"
          >
            <SmartCityIllustration />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
