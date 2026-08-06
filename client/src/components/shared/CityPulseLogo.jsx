// client/src/components/shared/CityPulseLogo.jsx — CityPulse AI Branding Logo Component
import React from 'react';
import { Link } from 'react-router-dom';

export default function CityPulseLogo({ className = '', size = 'md', showText = true, to = '/' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      <div className={`${sizeClasses[size] || 'w-10 h-10'} rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-200`}>
        <img
          src="/logo.png"
          alt="CityPulse AI Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      {showText && (
        <span className={`font-grotesk font-extrabold tracking-tight text-[#111827] dark:text-white flex items-center gap-1 ${textSizes[size] || 'text-2xl'}`}>
          CityPulse <span className="bg-gradient-to-r from-[#7C3AED] via-purple-600 to-violet-500 bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="focus:outline-none">{content}</Link>;
  }

  return content;
}
