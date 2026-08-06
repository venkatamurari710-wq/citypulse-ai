// client/src/pages/citizen/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import { CardSkeleton } from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className="stat-card group hover:border-primary-300 transition-all">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-xs`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {to && <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />}
      </div>
      <div className="text-3xl font-display font-extrabold text-neutral-900 mt-1">{value}</div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
    </div>
  );
  return to ? <Link to={to} className="block">{content}</Link> : <div>{content}</div>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, review: 0 });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/complaints?limit=6');
        const data = res.data.complaints || [];
        setComplaints(data);
        setStats({
          total: res.data.total || data.length,
          pending: data.filter(c => ['pending','analyzing','needs_review'].includes(c.status)).length,
          resolved: data.filter(c => ['resolved','closed'].includes(c.status)).length,
          review: data.filter(c => c.review_required).length,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Here's an overview of your submitted civic reports</p>
        </div>
        <Link to="/report" className="btn-primary hidden sm:flex">
          <Plus className="w-4 h-4" /> Report New Issue
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} color="bg-primary-600" to="/complaints" />
        <StatCard icon={Clock} label="Active Issues" value={stats.pending} color="bg-amber-500" to="/complaints?status=pending" />
        <StatCard icon={CheckCircle} label="Resolved Issues" value={stats.resolved} color="bg-emerald-600" to="/complaints?status=resolved" />
        <StatCard icon={AlertTriangle} label="Needs Officer Review" value={stats.review} color="bg-indigo-600" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/report', icon: Plus, label: 'New Report', desc: 'Submit a new civic complaint', color: 'bg-primary-50/60 border-primary-200 hover:border-primary-400' },
          { to: '/complaints', icon: FileText, label: 'My Complaints', desc: 'View all submitted issues', color: 'bg-white border-neutral-200 hover:border-neutral-300' },
          { to: '/map', icon: TrendingUp, label: 'City Map View', desc: 'See nearby reported issues', color: 'bg-white border-neutral-200 hover:border-neutral-300' },
        ].map(a => (
          <Link key={a.to} to={a.to} className={`card p-5 flex items-start gap-4 transition-all duration-200 shadow-sm ${a.color}`}>
            <div className="p-2.5 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <a.icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="font-bold text-neutral-900 text-sm">{a.label}</div>
              <div className="text-xs text-neutral-500 font-medium">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Reports</h2>
          <Link to="/complaints" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No complaints yet"
            description="Submit your first civic issue report and our AI will analyze it immediately."
            action={<Link to="/report" className="btn-primary">Report an Issue</Link>}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {complaints.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
