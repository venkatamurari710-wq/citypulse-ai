// client/src/components/landing/CategoriesSection.jsx
import { motion } from 'framer-motion';
import { Tag, Sparkles } from 'lucide-react';

const categories = [
  { name: 'Roads & Potholes', emoji: '🛣️', dept: 'Public Works', color: 'hover:border-amber-400 hover:bg-amber-50/50' },
  { name: 'Garbage & Sanitation', emoji: '🗑️', dept: 'Sanitation Dept', color: 'hover:border-emerald-400 hover:bg-emerald-50/50' },
  { name: 'Water Leakage', emoji: '💧', dept: 'Water Supply', color: 'hover:border-blue-400 hover:bg-blue-50/50' },
  { name: 'Sewage Overflow', emoji: '🌊', dept: 'Drainage Board', color: 'hover:border-cyan-400 hover:bg-cyan-50/50' },
  { name: 'Streetlight Failure', emoji: '💡', dept: 'Electrical Div', color: 'hover:border-yellow-400 hover:bg-yellow-50/50' },
  { name: 'Electrical Hazards', emoji: '⚡', dept: 'Power Utility', color: 'hover:border-rose-400 hover:bg-rose-50/50' },
  { name: 'Illegal Dumping', emoji: '🚯', dept: 'Enforcement', color: 'hover:border-purple-400 hover:bg-purple-50/50' },
  { name: 'Fallen Trees', emoji: '🌲', dept: 'Parks & Forestry', color: 'hover:border-green-400 hover:bg-green-50/50' },
  { name: 'Drainage Blockage', emoji: '🚰', dept: 'Stormwater Mgmt', color: 'hover:border-teal-400 hover:bg-teal-50/50' },
  { name: 'Infrastructure', emoji: '🏗️', dept: 'Civil Engineering', color: 'hover:border-slate-400 hover:bg-slate-100/50' },
  { name: 'Traffic Signals', emoji: '🚦', dept: 'Traffic Operations', color: 'hover:border-red-400 hover:bg-red-50/50' },
  { name: 'Safety Hazards', emoji: '⚠️', dept: 'Public Safety', color: 'hover:border-orange-400 hover:bg-orange-50/50' },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Comprehensive Coverage
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
            What Can You Report?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Our Gemini AI is trained to recognize over 50+ types of civic issues across all major municipal departments.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              viewport={{ once: true }}
              className={`flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-4 py-3.5 transition-all duration-200 cursor-default shadow-2xs group hover:-translate-y-0.5 ${cat.color}`}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                {cat.emoji}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
