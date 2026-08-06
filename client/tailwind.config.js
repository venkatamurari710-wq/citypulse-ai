/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft Violet (#7C3AED) Theme Palette
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed', // Pure Soft Violet #7C3AED
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Dark Slate (#111827) Text Palette
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1f2937',
          900: '#111827', // Pure Dark Slate #111827
          950: '#030712',
        },
        accent: {
          50:  '#f5f3ff',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        success: { 50: '#f0fdf4', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        neutral: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
        'hero-badge': 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
        'violet-glow': 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40h40M40 0v40' fill='none' stroke='%237c3aed' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(17, 24, 39, 0.05), 0 1px 2px rgba(17, 24, 39, 0.03)',
        'card-md': '0 4px 12px -2px rgba(124, 58, 237, 0.08), 0 2px 4px -2px rgba(17, 24, 39, 0.04)',
        'card-lg': '0 12px 24px -4px rgba(124, 58, 237, 0.12), 0 4px 8px -4px rgba(17, 24, 39, 0.04)',
        'card-hover': '0 12px 30px -5px rgba(124, 58, 237, 0.2), 0 4px 12px -6px rgba(17, 24, 39, 0.08)',
        'glow-primary': '0 0 30px -5px rgba(124, 58, 237, 0.45)',
        'glow-violet': '0 0 25px -5px rgba(124, 58, 237, 0.35)',
        'glow-sm': '0 0 0 2px rgba(124, 58, 237, 0.25)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:{ from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.6))' },
          '50%': { opacity: '1', transform: 'scale(1.06)', filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.9))' },
        },
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
