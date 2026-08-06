// client/src/pages/public/LandingPage.jsx
import { Link } from 'react-router-dom';
import { Shield, Brain, MapPin, Bell, ChevronRight, Zap, Users, Globe, ArrowRight } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Triage', desc: 'Gemini AI analyzes text, images, audio and video to classify and prioritize every complaint automatically.' },
  { icon: MapPin, title: 'Location Intelligence', desc: 'GPS-based complaint clustering detects duplicate reports and predicts civic issue hotspots across your city.' },
  { icon: Zap, title: 'Instant Routing', desc: 'Complaints are automatically routed to the right department based on AI classification and jurisdiction rules.' },
  { icon: Bell, title: 'Real-Time Updates', desc: 'Citizens receive transparent status updates at every step, from submission to resolution.' },
  { icon: Users, title: 'Multi-Role Workflow', desc: 'Citizen, Officer, Department Admin, and Super Admin roles with tailored interfaces and permissions.' },
  { icon: Globe, title: 'Multilingual Support', desc: 'AI adapts explanations and responses to citizen language preferences for inclusive civic participation.' },
];

const categories = [
  '🛣 Roads & Potholes', '🗑 Garbage & Sanitation', '💧 Water Leakage', '🌊 Sewage Overflow',
  '💡 Streetlight Failure', '⚡ Electrical Hazards', '🚯 Illegal Dumping', '🌲 Fallen Trees',
  '🚰 Drainage Blockage', '🏗 Infrastructure', '🚦 Traffic Signals', '⚠ Safety Hazards',
];

const stats = [
  { value: '50K+', label: 'Complaints Processed' },
  { value: '94%', label: 'Resolution Rate' },
  { value: '4.2h', label: 'Avg Response Time' },
  { value: '48', label: 'Cities Onboarded' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Navbar */}
      <nav className="border-b border-neutral-200 backdrop-blur-md sticky top-0 z-50 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-neutral-900 tracking-tight">CityPulse AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary btn text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-white border-b border-neutral-200">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-100/60 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold mb-8 animate-fade-in shadow-xs">
            <Brain className="w-4 h-4 text-primary-600" />
            Powered by Google Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-neutral-900 leading-tight tracking-tight mb-6 animate-slide-up">
            Smarter Cities.<br />
            <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Faster Civic Resolutions.
            </span>
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed mb-10 max-w-2xl mx-auto font-normal animate-slide-up">
            CityPulse AI transforms citizen complaints into actionable civic intelligence.
            Report issues in text, photos, videos, or voice — our AI handles classification and routing.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up">
            <Link to="/register" className="btn-primary btn-lg">
              Get Started / Create Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary btn-lg">
              Sign In to Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-neutral-100/60 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-display font-extrabold text-primary-600 mb-1">{s.value}</div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-neutral-900 mb-3">Built for Modern Cities</h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-base">A complete civic operations platform with AI intelligence at its core.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="card-hover p-6 bg-white border-neutral-200">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 border border-primary-100 shadow-xs">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-900 text-center mb-8">What Can You Report?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-default shadow-xs">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-neutral-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-neutral-900 mb-3">Ready to Make Your City Better?</h2>
          <p className="text-neutral-600 mb-8 text-base">Join thousands of citizens reporting issues and getting faster resolutions.</p>
          <Link to="/register" className="btn-primary btn-lg mx-auto">
            Create Free Account <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            <span>© 2026 CityPulse AI</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-neutral-900 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
