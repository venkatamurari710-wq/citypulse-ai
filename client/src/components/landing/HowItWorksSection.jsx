// client/src/components/landing/HowItWorksSection.jsx
import { motion } from 'framer-motion';
import { Camera, Cpu, Send, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Report Issue',
    desc: 'Snap a photo, record audio, upload video, or type a text complaint with your current GPS location.',
    icon: Camera,
    color: 'from-[#7C3AED] to-purple-600',
    highlight: 'Multi-Modal Input',
  },
  {
    step: '02',
    title: 'Gemini AI Triage',
    desc: 'Google Gemini AI classifies the civic hazard, assigns severity rating, and checks for duplicate reports nearby.',
    icon: Cpu,
    color: 'from-[#7C3AED] to-purple-600',
    highlight: 'Instant Intelligence',
  },
  {
    step: '03',
    title: 'Automated Routing',
    desc: 'System immediately dispatches work orders directly to assigned department officers with GPS route map.',
    icon: Send,
    color: 'from-[#7C3AED] to-purple-600',
    highlight: '< 1 Sec Dispatch',
  },
  {
    step: '04',
    title: 'Verified Resolution',
    desc: 'Field officers upload completion photos. Citizens receive instant push status updates and rate the service.',
    icon: CheckCircle2,
    color: 'from-[#7C3AED] to-purple-600',
    highlight: 'Full Transparency',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-[#7C3AED] dark:text-violet-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-grotesk font-extrabold text-[#111827] dark:text-white tracking-tight mb-4">
            From Complaint to Resolution in Hours
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            See how CityPulse AI eliminates manual bureaucracy with automated neural classification and instant dispatch.
          </p>
        </div>

        {/* Steps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative font-sans">
          
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-grotesk font-extrabold text-3xl text-slate-300 dark:text-slate-700 group-hover:text-[#7C3AED] dark:group-hover:text-violet-400 transition-colors">
                      {item.step}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-grotesk font-bold text-[#111827] dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-violet-50 group-hover:text-[#7C3AED] transition-colors">
                    {item.highlight}
                  </span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all hidden lg:block" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
