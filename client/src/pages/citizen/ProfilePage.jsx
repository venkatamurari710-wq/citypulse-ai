// client/src/pages/citizen/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { Mail, Phone, Calendar } from 'lucide-react';
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
      await api.put('/auth/profile', form);
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
            <label>Full Name</label>
            <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
          </div>
          <div className="form-field">
            <label>Preferred Language</label>
            <select value={form.preferred_language} onChange={e => setForm(p => ({ ...p, preferred_language: e.target.value }))}>
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
