// client/src/layouts/AdminLayout.jsx — Admin Portal Layout with Indigo-Blue theme
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileText, Settings, GitBranch, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CityPulseLogo from '../components/shared/CityPulseLogo';

export default function AdminLayout({ children }) {
  const { user } = useAuth();

  const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/complaints', icon: FileText, label: 'All Complaints' },
    { to: '/admin/routing-rules', icon: GitBranch, label: 'Routing Rules' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50/60 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <div className="mb-3">
            <CityPulseLogo size="sm" to="/admin" />
          </div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main App
          </Link>
        </div>
        <nav className="flex-1 p-3.5 flex flex-col gap-1 font-sans">
          {adminNav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium">
          {user?.full_name} · <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 animate-fade-in overflow-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
