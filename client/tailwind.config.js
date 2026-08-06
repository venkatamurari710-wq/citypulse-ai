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
        // Logo Civic Navy & Blue Palette (#0F2C59 / #1E3A8A)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a', // Logo Deep Civic Blue #1E3A8A
          900: '#0f2c59', // Logo Navy #0F2C59
          950: '#0a192f',
        },
        // Logo Eco Green Palette (#16A34A / #15803D)
        emerald: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Logo Green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Logo Circuit Amber/Orange Accent Palette (#EA580C)
        amber: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c', // Logo Circuit Orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50:  '#f0fdf4',
          500: '#16a34a',
          600: '#15803d',
        },
        success: { 50: '#f0fdf4', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fff7ed', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
        danger:  { 50: '#fef2f2', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        neutral: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0F2C59 0%, #1E3A8A 50%, #16A34A 100%)',
        'hero-badge': 'linear-gradient(135deg, rgba(15, 44, 89, 0.06) 0%, rgba(22, 163, 74, 0.06) 100%)',
        'logo-glow': 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 138, 0.08) 0%, transparent 70%)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40h40M40 0v40' fill='none' stroke='%230f2c59' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(15, 44, 89, 0.05), 0 1px 2px rgba(15, 44, 89, 0.03)',
        'card-md': '0 4px 12px -2px rgba(15, 44, 89, 0.08), 0 2px 4px -2px rgba(15, 44, 89, 0.04)',
        'card-lg': '0 12px 24px -4px rgba(15, 44, 89, 0.1), 0 4px 8px -4px rgba(15, 44, 89, 0.04)',
        'card-hover': '0 12px 28px -5px rgba(30, 58, 138, 0.15), 0 4px 10px -6px rgba(15, 44, 89, 0.06)',
        'glow-primary': '0 0 25px -5px rgba(30, 58, 138, 0.3)',
        'glow-green': '0 0 25px -5px rgba(22, 163, 74, 0.3)',
        'glow-sm': '0 0 0 2px rgba(30, 58, 138, 0.2)',
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
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(30, 58, 138, 0.5))' },
          '50%': { opacity: '1', transform: 'scale(1.06)', filter: 'drop-shadow(0 0 30px rgba(30, 58, 138, 0.8))' },
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
