// client/src/pages/admin/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { Users, FileText, Building2, ClipboardList, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../services/api';
import { PageLoader } from '../../components/shared/LoadingSpinner';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-display font-extrabold text-neutral-900">{value ?? '—'}</div>
      <div className="text-xs font-semibold text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/insights/trends?days=14'),
        ]);
        setStats(statsRes.data);
        setTrends(trendsRes.data.trends || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="page-title">Admin Operations Overview</h1>
        <p className="text-neutral-500 text-sm mt-1 font-medium">Platform telemetry, operational metrics, and system analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users} color="bg-primary-600" />
        <StatCard icon={FileText} label="Total Complaints" value={stats?.total_complaints} color="bg-neutral-800" />
        <StatCard icon={Activity} label="Resolved Issues" value={stats?.resolved_complaints} color="bg-emerald-600" />
        <StatCard icon={ClipboardList} label="Pending Review" value={stats?.pending_review} color="bg-amber-500" />
        <StatCard icon={Building2} label="Active Departments" value={stats?.active_departments} color="bg-indigo-600" />
      </div>

      {trends.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="section-title mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" /> Complaint Trends (14 days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} dot={false} name="Total" />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-5">Daily Volume Analysis</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total" />
                <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
