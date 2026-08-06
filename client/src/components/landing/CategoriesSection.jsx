// client/src/components/landing/CategoriesSection.jsx
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

const categories = [
  { name: 'Roads & Potholes', emoji: '🛣️', dept: 'Roads Department' },
  { name: 'Garbage & Sanitation', emoji: '🗑️', dept: 'Sanitation Dept' },
  { name: 'Water Leakage', emoji: '💧', dept: 'Water Supply' },
  { name: 'Sewage Overflow', emoji: '🌊', dept: 'Drainage & Sewage' },
  { name: 'Streetlight Failure', emoji: '💡', dept: 'Electrical Department' },
  { name: 'Electrical Hazards', emoji: '⚡', dept: 'Electrical Department' },
  { name: 'Illegal Dumping', emoji: '🚯', dept: 'Sanitation Dept' },
  { name: 'Fallen Trees', emoji: '🌲', dept: 'Public Works' },
  { name: 'Drainage Blockage', emoji: '🚰', dept: 'Drainage & Sewage' },
  { name: 'Infrastructure Damage', emoji: '🏗️', dept: 'Public Works' },
  { name: 'Traffic Signals', emoji: '🚦', dept: 'Traffic Department' },
  { name: 'Safety Hazards', emoji: '⚠️', dept: 'Municipal Review Unit' },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-[#7C3AED] dark:text-violet-300 text-xs font-bold mb-4">
            <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
            Comprehensive Coverage
          </div>
          <h2 className="text-3xl sm:text-4xl font-grotesk font-extrabold text-[#111827] dark:text-white mb-3">
            What Can You Report?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Our Gemini AI is trained to recognize over 50+ types of civic issues across all major municipal departments.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 font-sans">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-4 py-3.5 hover:border-[#7C3AED]/40 dark:hover:border-violet-500 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 cursor-default shadow-xs group hover:-translate-y-0.5"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                {cat.emoji}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#111827] dark:text-slate-200 truncate group-hover:text-[#7C3AED] dark:group-hover:text-violet-400 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {cat.dept}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
