// client/src/pages/citizen/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { Mail, Phone, Calendar, Lock, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', preferred_language: user?.preferred_language || 'en' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      if (res.data?.user) {
        localStorage.setItem('citypulse_user', JSON.stringify(res.data.user));
      }
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    citizen: 'badge-primary',
    officer: 'badge-accent',
    department_admin: 'badge-warning',
    super_admin: 'badge-danger',
  };

  const assignedDept = user?.assignedDepartment || user?.departments?.name || (user?.role === 'officer' ? 'Not Assigned' : null);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <h1 className="page-title">Profile Settings</h1>

      {/* User info card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md">
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900">{user?.full_name}</h2>
            <p className="text-neutral-500 text-sm font-medium">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className={`badge border ${roleColors[user?.role] || 'badge-ghost'}`}>
                {user?.role?.replace('_', ' ')}
              </span>
              {assignedDept && (
                <span className="badge bg-primary-50 text-primary-800 border-primary-200 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary-600" /> {assignedDept}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
            <Mail className="w-4 h-4 text-neutral-400" />
            {user?.email}
          </div>
          {user?.phone && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
              <Phone className="w-4 h-4 text-neutral-400" />
              {user?.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
            <Calendar className="w-4 h-4 text-neutral-400" />
            Member since {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Edit Personal Info</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="form-field">
            <label htmlFor="full_name">Full Name</label>
            <input id="full_name" type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
          </div>

          {/* Read-Only Assigned Department Field for Officers / Privileged Users */}
          {(user?.role === 'officer' || user?.role === 'department_admin' || assignedDept) && (
            <div className="form-field">
              <label htmlFor="assigned_dept" className="flex items-center justify-between">
                <span>Assigned Department</span>
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-neutral-400" /> Read Only
                </span>
              </label>
              <div className="relative">
                <input
                  id="assigned_dept"
                  type="text"
                  readOnly
                  disabled
                  value={assignedDept || 'Not Assigned'}
                  className="bg-neutral-100/90 text-neutral-700 border-neutral-200 cursor-not-allowed pr-10 font-semibold select-none"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-neutral-500 mt-1 font-medium flex items-center gap-1">
                Your assigned department is managed by the system and cannot be changed.
              </p>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="preferred_language">Preferred Language</label>
            <select id="preferred_language" value={form.preferred_language} onChange={e => setForm(p => ({ ...p, preferred_language: e.target.value }))}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
