// client/src/components/landing/StatsSection.jsx
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Building, TrendingUp } from 'lucide-react';

const stats = [
  {
    value: '50,000+',
    label: 'Complaints Processed',
    desc: 'Automated AI classification',
    icon: TrendingUp,
  },
  {
    value: '94%',
    label: 'Resolution Rate',
    desc: 'Across all registered categories',
    icon: CheckCircle2,
  },
  {
    value: '4.2 Hours',
    label: 'Avg Response Time',
    desc: 'Down from 72+ hours traditional',
    icon: Clock,
  },
  {
    value: '48 Cities',
    label: 'Municipalities Onboarded',
    desc: 'Active civic departments',
    icon: Building,
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    Live Metric
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-1 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-200 mb-1">{stat.label}</div>
                <div className="text-xs text-slate-400 font-normal">{stat.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
