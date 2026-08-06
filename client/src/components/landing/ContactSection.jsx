// client/src/components/landing/ContactSection.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 lg:py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Card */}
        <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Ambient lighting inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <MessageSquare className="w-3.5 h-3.5" />
                Get in Touch & Partnerships
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
                Ready to Upgrade Your City's Civic Response?
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Whether you are a citizen looking to report an issue, an officer needing portal access, or a city administration seeking platform onboarding — we are here to assist.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-slate-900 bg-white hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white border border-white/30 hover:bg-white/10 transition-all duration-200"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>

            {/* Right Contact Info Box */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                CityPulse AI Operations HQ
              </h3>

              <div className="space-y-4 text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>100 Civic Center Plaza, Suite 400<br />Smart City Operations Hub, SC 90210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>support@citypulseai.gov / contact@citypulseai.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>+1 (800) 555-CITY (24/7 AI Hotline)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-300">
                <span>Average Support Response: &lt; 15 mins</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Systems Operational
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
