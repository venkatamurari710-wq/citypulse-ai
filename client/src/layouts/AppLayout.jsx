// client/src/layouts/AppLayout.jsx — Main authenticated app shell (light mode)
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, FileText, Map, Plus, LogOut,
  User, Menu, X, ClipboardList, Building2, Flame,
  Settings, ChevronDown, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : ''}`
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
    { to: '/review-queue', icon: ClipboardList, label: 'Review Queue' },
    { to: '/hotspots', icon: Flame, label: 'Hotspots' },
    { to: '/departments', icon: Building2, label: 'Departments' },
  ];

  const adminNav = [
    { to: '/admin', icon: Settings, label: 'Admin Panel' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 
        flex flex-col z-40 transition-transform duration-300 shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        
        {/* Logo */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-display font-bold text-neutral-900">CityPulse AI</div>
              <div className="text-xs text-neutral-500 capitalize font-medium">{user?.role?.replace('_', ' ')}</div>
            </div>
          </Link>
          <button className="lg:hidden text-neutral-400 hover:text-neutral-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-1 mt-1">Main Menu</div>
          {citizenNav.map(n => <NavItem key={n.to} {...n} />)}

          {isOfficer && (
            <>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mt-4 mb-1">Officer Tools</div>
              {officerNav.map(n => <NavItem key={n.to} {...n} />)}
            </>
          )}

          {isAdmin && (
            <>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mt-4 mb-1">Administration</div>
              {adminNav.map(n => <NavItem key={n.to} {...n} />)}
            </>
          )}
        </nav>

        {/* Profile section */}
        <div className="p-3.5 border-t border-neutral-100 bg-neutral-50/50">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(p => !p)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-neutral-200 transition-all shadow-xs"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user?.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-semibold text-neutral-900 truncate">{user?.full_name}</div>
                <div className="text-xs text-neutral-500 truncate font-medium">{user?.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 card py-1 animate-slide-up shadow-card-lg border border-neutral-200">
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 transition-colors font-medium" onClick={() => setProfileOpen(false)}>
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
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-xs">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <span className="font-display font-bold text-neutral-900 text-sm">CityPulse AI</span>
          </Link>
          <Link to="/report" className="p-2 bg-primary-600 rounded-lg text-white">
            <Plus className="w-4 h-4" />
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
