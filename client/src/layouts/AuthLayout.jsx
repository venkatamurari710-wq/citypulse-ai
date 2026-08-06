// client/src/layouts/AuthLayout.jsx — Authentication Layout with Indigo-Blue Background
import React from 'react';
import { Link } from 'react-router-dom';
import CityPulseLogo from '../components/shared/CityPulseLogo';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel — rich Indigo-Blue gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-700 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        
        <CityPulseLogo size="lg" lightText={true} to="/" />
        
        <div className="relative z-10">
          <h2 className="text-4xl font-grotesk font-extrabold text-white leading-tight mb-4">
            Smart Civic<br />Intelligence<br />Platform
          </h2>
          <p className="text-indigo-100 text-base leading-relaxed max-w-md font-sans">
            AI-powered complaint management for modern municipalities. 
            Report issues, track resolutions, and make your city smarter.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 font-sans">
            {[
              { label: 'Complaints Resolved', value: '12,450+' },
              { label: 'Cities Served', value: '48' },
              { label: 'Avg Response Time', value: '4.2h' },
              { label: 'Satisfaction Rate', value: '94%' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4">
                <div className="text-2xl font-grotesk font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-indigo-100 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-200 text-xs font-sans">© 2026 CityPulse AI. All rights reserved.</p>
      </div>

      {/* Right panel — clean white form container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in bg-white p-8 rounded-2xl border border-slate-200 shadow-card-lg">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <CityPulseLogo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
