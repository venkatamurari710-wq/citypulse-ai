// client/src/components/shared/DepartmentOfficerSelect.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function DepartmentOfficerSelect({ value, onChange, includeOfficers = true, className = '' }) {
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dRes, oRes] = await Promise.all([
          api.get('/departments').catch(() => ({ data: { departments: [] } })),
          api.get('/department-officers').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setDepartments(dRes.data?.departments || dRes.data || []);
        
        const rawOfficers = Array.isArray(oRes.data) ? oRes.data : [];
        setOfficers(rawOfficers.map(o => ({
          id: o.id,
          label: o.label || `${o.department_name || 'Department'} — ${o.officer_title}`,
          value: o.id,
          user_id: o.user_id,
          department_id: o.department_id,
        })));
      } catch (e) {
        console.error('Failed to load departments/officers', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`form-field ${className}`}>
      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
        Assigned Department {includeOfficers ? '/ Officer' : ''}
      </label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
        className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 shadow-xs focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500"
      >
        <option value="">Select {includeOfficers ? 'department officer' : 'department'}...</option>
        {includeOfficers && officers.length > 0 ? (
          officers.map(o => <option key={o.id} value={o.id}>{o.label}</option>)
        ) : (
          departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
        )}
      </select>
    </div>
  );
}
