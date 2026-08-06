// client/src/components/landing/FeaturesSection.jsx
import { motion } from 'framer-motion';
import {
  Brain,
  MapPin,
  Zap,
  Bell,
  Users,
  Globe,
  Layers,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Triage',
    desc: 'Google Gemini AI analyzes image, video, audio, and text input to automatically extract category, severity score, and urgency.',
    badge: 'Gemini AI',
    bgColor: 'bg-blue-50 border-blue-200 text-[#1D4ED8]',
  },
  {
    icon: MapPin,
    title: 'Location Intelligence',
    desc: 'GPS-based geospatial clustering pinpoints precise issue coordinates, groups duplicates, and flags high-frequency hotspot zones.',
    badge: 'Geospatial',
    bgColor: 'bg-emerald-50 border-emerald-200 text-[#16A34A]',
  },
  {
    icon: Zap,
    title: 'Instant Automated Routing',
    desc: 'Complaints are routed in under 1 second to appropriate municipal departments based on category and jurisdictional boundary rules.',
    badge: '< 1s Routing',
    bgColor: 'bg-amber-50 border-amber-200 text-[#EA580C]',
  },
  {
    icon: Bell,
    title: 'Real-Time Status Tracking',
    desc: 'Citizens receive transparent live updates at every step — from initial submission to officer assignment and final resolution photo.',
    badge: 'Live Stream',
    bgColor: 'bg-blue-50 border-blue-200 text-[#1D4ED8]',
  },
  {
    icon: Users,
    title: 'Multi-Role Workflow',
    desc: 'Tailored interfaces for Citizens, Field Officers, Department Admins, and Municipal Leadership with permission guards.',
    badge: 'Role Access',
    bgColor: 'bg-emerald-50 border-emerald-200 text-[#16A34A]',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'AI dynamically translates explanations into local languages, making civic participation accessible to all citizens.',
    badge: 'Inclusive',
    bgColor: 'bg-indigo-50 border-indigo-200 text-[#1E3A8A]',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold mb-4">
            <Layers className="w-3.5 h-3.5" />
            Cutting-Edge Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-grotesk font-extrabold text-[#0F2C59] tracking-tight mb-4">
            Built for the Next Generation of Smart Cities
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Empowering municipal teams with AI automation while giving citizens unprecedented transparency and resolution speed.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="group relative bg-white hover:bg-slate-50/60 border border-slate-200/80 hover:border-[#1D4ED8]/40 rounded-3xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-110 transition-transform duration-300 ${f.bgColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#1D4ED8] transition-colors">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-grotesk font-bold text-[#0F2C59] mb-2.5 group-hover:text-[#1D4ED8] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal font-sans">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] opacity-90 group-hover:opacity-100 transition-opacity font-sans">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  <span>Integrated in Platform</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
