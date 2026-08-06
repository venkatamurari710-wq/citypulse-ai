// client/src/components/shared/CityPulseLogo.jsx — Clean Balloon Pin Logo Component
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
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Balloon Pin Logo Image — Transparent, no background box */}
      <img
        src="/logo.png"
        alt="CityPulse AI Logo"
        className={`${sizeClasses[size] || 'w-10 h-10'} object-contain shrink-0 group-hover:scale-105 transition-transform duration-200`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
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
