// client/src/pages/officer/OfficerDepartmentsPage.jsx
import { useState, useEffect } from 'react';
import { Building2, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/shared/LoadingSpinner';

export default function OfficerDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data.departments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">Municipal Departments</h1>
        <p className="text-sm font-medium text-neutral-500 mt-1">Directory of configured city departments and jurisdiction channels</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments configured" description="No departments have been configured yet." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(d => (
            <div key={d.id} className={`card p-5 ${!d.active ? 'opacity-60 bg-neutral-50' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100 shadow-xs">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">{d.name}</h3>
                  {!d.active && <span className="badge badge-ghost text-xs mt-0.5">Inactive</span>}
                </div>
              </div>
              {d.description && <p className="text-xs text-neutral-600 mb-3 leading-relaxed font-medium">{d.description}</p>}
              <div className="space-y-1.5 pt-3 border-t border-neutral-100">
                {d.contact_email && (
                  <a href={`mailto:${d.contact_email}`} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-primary-600 font-medium transition-colors">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" /> {d.contact_email}
                  </a>
                )}
                {d.contact_phone && (
                  <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" /> {d.contact_phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
