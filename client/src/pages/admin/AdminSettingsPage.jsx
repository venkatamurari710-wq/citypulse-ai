// client/src/pages/admin/AdminSettingsPage.jsx
import { useState, useEffect } from 'react';
import { Shield, Clock, Activity } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs?limit=50')
      .then(res => setLogs(res.data.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">System Settings & Audit Trail</h1>
        <p className="text-neutral-500 text-sm mt-1 font-medium">Platform architecture configuration and security audit logs</p>
      </div>

      {/* Platform Info */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Shield, label: 'Security Model', value: 'JWT + bcrypt + Supabase RLS' },
          { icon: Activity, label: 'AI Inference Model', value: 'Google Gemini 1.5 Flash' },
          { icon: Clock, label: 'System Build', value: '1.0.0 (Production Grade)' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-start gap-3">
            <div className="p-2.5 bg-primary-50 rounded-xl border border-primary-100">
              <s.icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{s.label}</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Logs */}
      <div className="card overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
          <Activity className="w-4 h-4 text-primary-600" />
          <h2 className="section-title">System Audit Log</h2>
        </div>
        <table className="table-base">
          <thead><tr><th>Action</th><th>User</th><th>Complaint ID</th><th>Timestamp</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}><TableSkeleton rows={8} cols={4} /></td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td><span className="badge badge-ghost font-mono">{log.action?.replace(/_/g,' ')}</span></td>
                <td className="text-xs text-neutral-700 font-semibold">{log.users?.full_name || '—'}</td>
                <td className="text-xs text-neutral-500 font-mono">{log.complaint_id ? log.complaint_id.slice(0,8)+'...' : '—'}</td>
                <td className="text-xs text-neutral-500 font-medium">{log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
