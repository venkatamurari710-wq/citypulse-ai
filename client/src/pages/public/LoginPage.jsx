// client/src/pages/public/LoginPage.jsx — Unified Sign In Page (Citizen / Officer / Admin)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, LogIn, User, Shield, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('citizen'); // 'citizen' | 'officer' | 'department_admin'
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    govt_id: '',
    department_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch departments for officer dropdown
    api.get('/departments')
      .then(res => {
        const list = res.data?.departments || (Array.isArray(res.data) ? res.data : []);
        setDepartments(list);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Pass role, govt_id, and department_id in login credentials
      const user = await login(form.email, form.password, {
        role,
        govt_id: ['officer', 'department_admin'].includes(role) ? form.govt_id.trim() : undefined,
        department_id: role === 'officer' && form.department_id ? form.department_id : undefined,
      });

      toast(`Welcome back, ${user.full_name}!`, 'success');

      if (user.role === 'super_admin' || user.role === 'department_admin') {
        navigate('/admin');
      } else if (user.role === 'officer') {
        navigate('/review-queue');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || (typeof data?.details === 'string' ? data.details : err.message || 'Login failed. Please check your credentials.');
      toast(msg, 'error');
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <h2 className="text-2xl font-display font-extrabold text-neutral-900 mb-1">Welcome back</h2>
      <p className="text-neutral-500 text-sm mb-5">Sign in to your CityPulse account</p>

      {/* Role Selection Question */}
      <div className="space-y-1.5 mb-5">
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Signing in as:</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => { setRole('citizen'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              role === 'citizen'
                ? 'bg-white text-primary-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Citizen
          </button>
          <button
            type="button"
            onClick={() => { setRole('officer'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              role === 'officer'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Officer
          </button>
          <button
            type="button"
            onClick={() => { setRole('department_admin'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              role === 'department_admin'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-field">
          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder={role === 'citizen' ? 'you@example.com' : 'official@city.gov'}
            required
            autoComplete="email"
          />
        </div>

        {/* Officer & Admin Govt ID Field */}
        {['officer', 'department_admin'].includes(role) && (
          <div className="form-field">
            <label htmlFor="govt_id">Government ID / Badge # *</label>
            <input
              id="govt_id"
              type="text"
              value={form.govt_id}
              onChange={set('govt_id')}
              placeholder="e.g., GOVT-94021 or BADGE-774"
              required
              className="font-mono"
            />
          </div>
        )}

        {/* Officer Department Selector */}
        {role === 'officer' && (
          <div className="form-field">
            <label htmlFor="department_id">Assigned Department *</label>
            <select
              id="department_id"
              value={form.department_id}
              onChange={set('department_id')}
              required
            >
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="password">Password *</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errors.general && (
          <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
            {errors.general}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><LogIn className="w-4 h-4" /> Sign In</>
          )}
        </button>
      </form>

      <p className="text-center text-neutral-500 text-sm mt-6 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}
