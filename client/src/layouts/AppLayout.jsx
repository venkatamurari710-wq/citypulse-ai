// client/src/layouts/AppLayout.jsx — Main authenticated app shell with Indigo-Blue theme
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Map, Plus, LogOut,
  User, Menu, X, Building2, Flame,
  Settings, ChevronDown, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CityPulseLogo from '../components/shared/CityPulseLogo';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
          isActive
            ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-200/80 shadow-2xs'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  const { user, logout, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const citizenNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/report', icon: Plus, label: 'Report Issue' },
    { to: '/complaints', icon: FileText, label: 'My Complaints' },
    { to: '/map', icon: Map, label: 'Map View' },
  ];

  const officerNav = [
    { to: '/review-queue', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hotspots', icon: Flame, label: 'Hotspots' },
    { to: '/departments', icon: Building2, label: 'Departments' },
    { to: '/map', icon: Map, label: 'Map View' },
  ];

  const adminNav = [
    { to: '/admin', icon: Settings, label: 'Admin Panel' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50/60 text-slate-900">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200/90 
        flex flex-col z-40 transition-transform duration-300 shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        
        {/* Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <CityPulseLogo size="sm" to={isOfficer ? "/review-queue" : "/dashboard"} />
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto font-sans">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-display">
              {isOfficer ? 'Officer Portal' : 'Citizen Workspace'}
            </div>
            {(isOfficer ? officerNav : citizenNav).map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-display">
                Administration
              </div>
              {adminNav.map(item => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          )}
        </nav>

        {/* Profile section */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(p => !p)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-2xs"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs">
                {(user?.full_name || user?.fullName || user?.email || 'U')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-semibold text-slate-900 truncate">{user?.full_name || user?.fullName || 'Officer'}</div>
                <div className="text-xs text-slate-500 truncate font-medium">{user?.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 card py-1 animate-slide-up shadow-card-lg border border-slate-200">
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-medium" onClick={() => setProfileOpen(false)}>
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
