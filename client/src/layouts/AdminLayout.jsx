// client/src/layouts/AdminLayout.jsx
import { Link, NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, Building2, FileText, Settings, GitBranch, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col shadow-xs">
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-display font-bold text-neutral-900">Admin Portal</span>
          </div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main App
          </Link>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {adminNav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <n.icon className="w-4 h-4" />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 text-xs text-neutral-500 font-medium">
          {user?.full_name} · <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
        </div>
      </aside>
      <main className="flex-1 p-8 animate-fade-in overflow-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
