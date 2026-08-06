// client/src/components/landing/Hero.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import SmartCityIllustration from './SmartCityIllustration';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-24">
      {/* Background radial gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-indigo-200/40 via-blue-100/20 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-radial from-blue-200/30 via-purple-100/20 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Powered by Google Gemini AI</span>
            </div>

            {/* Large Bold Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              Smarter Cities.<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Faster Civic Resolutions.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 max-w-xl">
              CityPulse AI transforms citizen complaints into actionable civic intelligence.
              Report issues in text, photos, videos, or voice — our AI handles classification and routing.
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-base text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Get Started / Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-base text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                <User className="w-4 h-4 text-slate-500" />
                Sign In to Platform
              </Link>
            </div>

            {/* Small Trusted Users Section */}
            <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
              <div className="flex items-center -space-x-2">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Citizen 1"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Citizen 2"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Citizen 3"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Citizen 4"
                />
              </div>
              <span className="text-slate-600 font-medium">
                Trusted by <strong className="text-slate-900 font-semibold">10,000+ citizens</strong> & <strong className="text-slate-900 font-semibold">25+ departments</strong>
              </span>
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
