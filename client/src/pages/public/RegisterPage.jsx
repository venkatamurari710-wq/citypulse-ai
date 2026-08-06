// client/src/pages/public/RegisterPage.jsx — Unified Account Registration (Citizen / Officer / Admin)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, UserPlus, Shield, User, Building2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('citizen'); // 'citizen' | 'officer' | 'department_admin'
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      return setErrors({ confirmPassword: 'Passwords do not match' });
    }

    if (['officer', 'department_admin'].includes(accountType)) {
      if (!form.govt_id || form.govt_id.trim() === '') {
        return setErrors({ govt_id: 'Government ID / Badge # is required' });
      }
    }

    if (accountType === 'officer' && !form.department_id) {
      return setErrors({ department_id: 'Assigned Department is mandatory for Officers' });
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: accountType,
        govt_id: ['officer', 'department_admin'].includes(accountType) ? form.govt_id.trim() : undefined,
        department_id: accountType === 'officer' && form.department_id ? form.department_id : undefined,
      };

      const user = await register(payload);
      toast(`Account created! Welcome to CityPulse AI (${user.role}).`, 'success');
      
      if (['officer', 'department_admin', 'super_admin'].includes(user.role)) {
        navigate(user.role === 'officer' ? '/review-queue' : '/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const errs = {};
        if (Array.isArray(data.details)) {
          data.details.forEach(d => { errs[d.field] = d.message; });
        } else {
          setErrors(data.details);
        }
        setErrors(errs);
      } else {
        const msg = data?.error || 'Registration failed. Please try again.';
        setErrors({ general: msg });
        toast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <h2 className="text-2xl font-display font-extrabold text-neutral-900 mb-1">Create Account</h2>
      <p className="text-neutral-500 text-sm mb-5">Select your role to get started</p>

      {/* Account Role Selector Tabs */}
      <div className="space-y-1.5 mb-5">
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Are you registering as a:</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => { setAccountType('citizen'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              accountType === 'citizen'
                ? 'bg-white text-primary-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Citizen
          </button>
          <button
            type="button"
            onClick={() => { setAccountType('officer'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              accountType === 'officer'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Officer
          </button>
          <button
            type="button"
            onClick={() => { setAccountType('department_admin'); setErrors({}); }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              accountType === 'department_admin'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin
          </button>
        </div>
      </div>

      {/* Info notice for officer/admin */}
      {accountType === 'officer' && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
          <p className="text-xs text-primary-900 font-medium">
            <span className="font-bold">Officer Onboarding:</span> Officers require a Government ID / Badge # and an Assigned Department.
          </p>
        </div>
      )}

      {accountType === 'department_admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 font-medium">
            <span className="font-bold">Admin Onboarding:</span> Municipal Department Admins require a valid Government ID / Badge # for credential verification.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="form-field">
          <label htmlFor="full_name">Full Name *</label>
          <input id="full_name" type="text" value={form.full_name} onChange={set('full_name')} placeholder={accountType === 'citizen' ? 'Jane Smith' : 'Officer / Admin Name'} required />
          {errors.full_name && <p className="field-error">{errors.full_name}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="reg_email">Official Email Address *</label>
          <input id="reg_email" type="email" value={form.email} onChange={set('email')} placeholder={accountType === 'citizen' ? 'jane@example.com' : 'official@city.gov'} required />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* Officer & Admin Govt ID Field */}
        {['officer', 'department_admin'].includes(accountType) && (
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
            {errors.govt_id && <p className="field-error">{errors.govt_id}</p>}
          </div>
        )}

        {/* Officer Department Selector */}
        {accountType === 'officer' && (
          <div className="form-field">
            <label htmlFor="department_id">Assigned Department *</label>
            <select id="department_id" value={form.department_id} onChange={set('department_id')} required>
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.department_id && <p className="field-error">{errors.department_id}</p>}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="phone">Phone Number (optional)</label>
          <input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="reg_password">Password *</label>
          <div className="relative">
            <input id="reg_password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 number" required className="w-full pr-11" />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" required />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        {errors.general && (
          <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{errors.general}</p>
        )}

        <p className="text-xs text-neutral-500">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 font-semibold underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="text-primary-600 font-semibold underline">Privacy Policy</Link>.
        </p>

        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create {accountType === 'officer' ? 'Officer' : accountType === 'department_admin' ? 'Admin' : 'Citizen'} Account</>}
        </button>
      </form>

      <p className="text-center text-neutral-500 text-sm mt-5 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
