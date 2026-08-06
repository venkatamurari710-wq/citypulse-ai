// client/src/pages/public/AboutPage.jsx
import { Link } from 'react-router-dom';
import { Shield, Brain, MapPin, Users, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-6 text-neutral-900">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-neutral-900">About CityPulse AI</h1>
        </div>
        <div className="space-y-6 text-neutral-700">
          <p className="text-lg leading-relaxed font-normal">
            CityPulse AI is a production-grade AI Civic Intelligence Platform designed for modern municipalities,
            contractors, and citizens who want faster, smarter resolution of civic issues.
          </p>
          <div className="grid md:grid-cols-2 gap-4 my-8">
            {[
              { icon: Brain, title: 'AI-First Triage', desc: 'Google Gemini AI analyzes multimodal complaint data to classify, prioritize, and route each issue.' },
              { icon: MapPin, title: 'Location Intelligence', desc: 'GPS-based clustering detects duplicates and generates predictive hotspot insights.' },
              { icon: Users, title: 'Multi-Role Platform', desc: 'Tailored experiences for citizens, officers, department admins, and super admins.' },
              { icon: Shield, title: 'Security First', desc: 'JWT authentication, bcrypt hashing, Supabase RLS, and zero client-side AI credential exposure.' },
            ].map(f => (
              <div key={f.title} className="card p-5 bg-white border-neutral-200">
                <f.icon className="w-6 h-6 text-primary-600 mb-3" />
                <h3 className="font-bold text-neutral-900 mb-1">{f.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-500 text-sm">
            Built with React, Vite, Tailwind CSS, Node.js, Express, Supabase PostgreSQL, and the Google GenAI SDK.
          </p>
        </div>
      </div>
    </div>
  );
}
