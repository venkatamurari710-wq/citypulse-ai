// client/src/pages/public/LandingPage.jsx
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import CategoriesSection from '../../components/landing/CategoriesSection';
import ContactSection from '../../components/landing/ContactSection';
import FooterSection from '../../components/landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section (Split into two columns with AI Smart City illustration) */}
      <Hero />

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 5. How It Works Process Section */}
      <HowItWorksSection />

      {/* 6. Reportable Categories Grid */}
      <CategoriesSection />

      {/* 7. Contact & Partnership Section */}
      <ContactSection />

      {/* 8. Modern Footer */}
      <FooterSection />
    </div>
  );
}
