// client/src/components/landing/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

import CityPulseLogo from '../shared/CityPulseLogo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Dashboard', href: '/dashboard', isRoute: true },
    { name: 'About Us', href: '/about', isRoute: true },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e, item) => {
    setActiveTab(item.name);
    if (item.isRoute) return;
    if (item.href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (item.href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(item.href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Logo */}
        <CityPulseLogo size="md" />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.name || (item.isRoute && location.pathname === item.href);
            return item.isRoute ? (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setActiveTab(item.name)}
                className={`relative py-1 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#7C3AED] dark:text-violet-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-violet-400'
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-violet-400 rounded-full"
                  />
                )}
              </Link>
            ) : (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`relative py-1 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#7C3AED] dark:text-violet-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-violet-400'
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-violet-400 rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Buttons & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark or Light Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#7C3AED] dark:text-violet-400 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 border border-violet-200 dark:border-slate-700 hover:border-violet-300 transition-all duration-200 shadow-2xs"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu & Theme toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#7C3AED] hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-5 pt-3 pb-6 space-y-3">
              <div className="grid gap-1">
                {navItems.map((item) =>
                  item.isRoute ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-[#7C3AED] hover:bg-violet-50/60"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className="px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-[#7C3AED] hover:bg-violet-50/60"
                    >
                      {item.name}
                    </a>
                  )
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl font-semibold text-[#7C3AED] bg-violet-50 border border-violet-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-purple-600 shadow-md"
                >
                  Get Started / Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
