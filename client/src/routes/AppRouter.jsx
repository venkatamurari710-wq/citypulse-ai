// client/src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AboutPage from '../pages/public/AboutPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import TermsPage from '../pages/public/TermsPage';

// Citizen pages
import DashboardPage from '../pages/citizen/DashboardPage';
import ReportPage from '../pages/citizen/ReportPage';
import ComplaintsPage from '../pages/citizen/ComplaintsPage';
import ComplaintDetailPage from '../pages/citizen/ComplaintDetailPage';
import MapPage from '../pages/citizen/MapPage';
import ProfilePage from '../pages/citizen/ProfilePage';

// Officer pages
import ReviewQueuePage from '../pages/officer/ReviewQueuePage';
import ReviewDetailPage from '../pages/officer/ReviewDetailPage';
import HotspotsPage from '../pages/officer/HotspotsPage';
import OfficerDepartmentsPage from '../pages/officer/OfficerDepartmentsPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import AdminDepartmentsPage from '../pages/admin/AdminDepartmentsPage';
import AdminComplaintsPage from '../pages/admin/AdminComplaintsPage';
import RoutingRulesPage from '../pages/admin/RoutingRulesPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-3">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-neutral-500">Restoring session...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'officer' ? '/review-queue' : '/dashboard'} replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'officer' ? '/review-queue' : '/dashboard'} replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<PublicOnlyRoute><AuthLayout><LoginPage /></AuthLayout></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><AuthLayout><RegisterPage /></AuthLayout></PublicOnlyRoute>} />

        {/* Citizen */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['citizen']}><AppLayout><ReportPage /></AppLayout></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><AppLayout><ComplaintsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/complaints/:complaintId" element={<ProtectedRoute><AppLayout><ComplaintDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

        {/* Officer */}
        <Route path="/review-queue" element={<ProtectedRoute allowedRoles={['officer','department_admin','super_admin']}><AppLayout><ReviewQueuePage /></AppLayout></ProtectedRoute>} />
        <Route path="/review-queue/:complaintId" element={<ProtectedRoute allowedRoles={['officer','department_admin','super_admin']}><AppLayout><ReviewDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute allowedRoles={['officer','department_admin','super_admin']}><AppLayout><OfficerDepartmentsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/hotspots" element={<ProtectedRoute allowedRoles={['officer','department_admin','super_admin']}><AppLayout><HotspotsPage /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['department_admin','super_admin']}><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['department_admin','super_admin']}><AdminLayout><UsersPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['department_admin','super_admin']}><AdminLayout><AdminDepartmentsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['department_admin','super_admin']}><AdminLayout><AdminComplaintsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/routing-rules" element={<ProtectedRoute allowedRoles={['department_admin','super_admin']}><AdminLayout><RoutingRulesPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
