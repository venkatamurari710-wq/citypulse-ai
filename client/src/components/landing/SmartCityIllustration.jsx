// client/src/components/landing/SmartCityIllustration.jsx
import { motion } from 'framer-motion';
import {
  Brain,
  MapPin,
  Trash2,
  Droplet,
  Lightbulb,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

const floatingCards = [
  {
    id: 'pothole',
    title: 'POTHOLE',
    subtitle: 'Detected',
    img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=150&auto=format&fit=crop&q=80',
    iconColor: 'bg-indigo-600 text-white',
    pinColor: '#6366F1',
    icon: MapPin,
    position: 'top-4 left-0 sm:left-4',
    delay: 0,
  },
  {
    id: 'garbage',
    title: 'GARBAGE',
    subtitle: 'Overflowing',
    img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=150&auto=format&fit=crop&q=80',
    iconColor: 'bg-emerald-500 text-white',
    pinColor: '#10B981',
    icon: Trash2,
    position: 'top-32 -left-2 sm:left-2',
    delay: 0.5,
  },
  {
    id: 'water',
    title: 'WATER LEAK',
    subtitle: 'Reported',
    img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=150&auto=format&fit=crop&q=80',
    iconColor: 'bg-blue-500 text-white',
    pinColor: '#3B82F6',
    icon: Droplet,
    position: 'bottom-20 left-12 sm:left-24',
    delay: 1,
  },
  {
    id: 'streetlight',
    title: 'STREET LIGHT',
    subtitle: 'Broken',
    img: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=150&auto=format&fit=crop&q=80',
    iconColor: 'bg-amber-500 text-white',
    pinColor: '#F59E0B',
    icon: Lightbulb,
    position: 'top-6 right-0 sm:right-6',
    delay: 1.5,
  },
  {
    id: 'dumping',
    title: 'ILLEGAL DUMPING',
    subtitle: 'Reported',
    img: 'https://images.unsplash.com/photo-1611284446314-60a55ac7deab?w=150&auto=format&fit=crop&q=80',
    iconColor: 'bg-orange-500 text-white',
    pinColor: '#F97316',
    icon: AlertOctagon,
    position: 'top-36 right-0 sm:right-2',
    delay: 2,
  },
];

const mapPins = [
  { id: 'pin-1', x: 22, y: 78, color: '#EF4444' }, // Red
  { id: 'pin-2', x: 38, y: 84, color: '#F97316' }, // Orange
  { id: 'pin-3', x: 55, y: 88, color: '#EAB308' }, // Yellow
  { id: 'pin-4', x: 72, y: 80, color: '#3B82F6' }, // Blue
  { id: 'pin-5', x: 86, y: 76, color: '#22C55E' }, // Green
];

export default function SmartCityIllustration() {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-6">
      {/* Outer Glow Backdrop */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-300/30 via-blue-200/20 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Main Illustration Canvas */}
      <div className="relative w-full h-[420px] sm:h-[480px] flex items-center justify-center">
        
        {/* SVG Connected Dotted Lines Canvas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="aiPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Lines connecting Brain Sphere to cards */}
          <g stroke="url(#aiPulseGrad)" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-60">
            <line x1="50%" y1="28%" x2="20%" y2="15%" />
            <line x1="50%" y1="28%" x2="18%" y2="40%" />
            <line x1="50%" y1="28%" x2="30%" y2="70%" />
            <line x1="50%" y1="28%" x2="80%" y2="16%" />
            <line x1="50%" y1="28%" x2="82%" y2="44%" />
          </g>
        </svg>

        {/* TOP CENTER: Glowing AI Brain Core Sphere */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 blur-xl"
          />

          {/* AI Glowing Orb */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 p-1 shadow-2xl shadow-indigo-500/50 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-indigo-300/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366f133_0%,transparent_70%)]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-1 rounded-full border border-dashed border-indigo-400/40"
              />
              <Brain className="w-12 h-12 sm:w-14 sm:h-14 text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)] relative z-10" />
            </div>
          </div>
        </div>

        {/* CENTER: Futuristic 3D City Skyline Buildings */}
        <div className="absolute top-28 inset-x-0 bottom-24 flex items-end justify-center z-20 pointer-events-none">
          <div className="relative w-72 sm:w-80 h-48 flex items-end justify-center">
            <svg viewBox="0 0 320 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bldgGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4138D9" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="bldgGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="bldgGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Back building towers */}
              <rect x="30" y="70" width="35" height="130" rx="3" fill="url(#bldgGrad2)" />
              <rect x="75" y="40" width="40" height="160" rx="4" fill="url(#bldgGrad1)" />
              <rect x="125" y="20" width="45" height="180" rx="4" fill="url(#bldgGrad2)" />
              <rect x="180" y="45" width="40" height="155" rx="4" fill="url(#bldgGrad1)" />
              <rect x="230" y="75" width="35" height="125" rx="3" fill="url(#bldgGrad2)" />
              <rect x="270" y="100" width="25" height="100" rx="3" fill="url(#bldgGrad1)" />

              {/* Glowing architectural windows */}
              {[...Array(8)].map((_, i) => (
                <rect key={`w1-${i}`} x="85" y={55 + i * 15} width="20" height="4" rx="1" fill="#93C5FD" opacity="0.8" />
              ))}
              {[...Array(10)].map((_, i) => (
                <rect key={`w2-${i}`} x="135" y={35 + i * 14} width="25" height="4" rx="1" fill="#A5B4FC" opacity="0.9" />
              ))}
              {[...Array(8)].map((_, i) => (
                <rect key={`w3-${i}`} x="190" y={60 + i * 15} width="20" height="4" rx="1" fill="#60A5FA" opacity="0.8" />
              ))}
            </svg>
          </div>
        </div>

        {/* BOTTOM: 3D Isometric Glowing Map Base */}
        <div className="absolute bottom-2 inset-x-2 sm:inset-x-6 h-36 sm:h-40 z-10 preserve-3d">
          <div
            className="w-full h-full rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-400/50 shadow-2xl shadow-indigo-500/30 overflow-hidden relative"
            style={{
              transform: 'perspective(600px) rotateX(42deg)',
              transformOrigin: 'center bottom',
            }}
          >
            {/* Glowing Map Grid Roads & Rivers */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf822_2px,transparent_2px),linear-gradient(to_bottom,#818cf822_2px,transparent_2px)] bg-[size:28px_28px]" />

            {/* Glowing River Path */}
            <svg className="absolute inset-0 w-full h-full opacity-60">
              <path
                d="M 0,80 Q 100,20 200,90 T 400,40"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="12"
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px #38bdf8)"
              />
              <path
                d="M 80,0 L 220,150"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeDasharray="8 4"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* 3D COLORFUL MAP LOCATION PINS */}
          {mapPins.map((pin) => (
            <motion.div
              key={pin.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full z-30 flex flex-col items-center cursor-pointer group"
            >
              <div className="relative flex flex-col items-center">
                {/* Glowing Pulse Ring under Pin */}
                <span
                  className="w-4 h-2 rounded-full animate-ping opacity-75 absolute -bottom-1"
                  style={{ backgroundColor: pin.color }}
                />
                {/* 3D Pin Head */}
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: pin.color }}
                >
                  <MapPin className="w-3.5 h-3.5 fill-white" />
                </div>
                {/* Pin Tip */}
                <div
                  className="w-1.5 h-2 -mt-1 rounded-b-sm"
                  style={{ backgroundColor: pin.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* FLOATING ISSUE CARDS */}
        {floatingCards.map((card) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: card.delay }}
              className={`absolute ${card.position} z-40`}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.delay,
                }}
                className="bg-white/95 backdrop-blur-md border border-indigo-100/90 rounded-2xl p-2 sm:p-2.5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 max-w-[170px] sm:max-w-[190px] cursor-default"
              >
                {/* Image Thumbnail */}
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 shadow-xs border border-slate-200"
                />

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-extrabold text-slate-900 tracking-tight truncate">
                      {card.title}
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 truncate flex items-center gap-1">
                    <span>{card.subtitle}</span>
                  </div>
                </div>

                {/* Small Icon Badge */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs ${card.iconColor}`}
                >
                  <CardIcon className="w-3 h-3" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}
