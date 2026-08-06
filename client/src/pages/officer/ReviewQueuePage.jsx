// client/src/pages/officer/ReviewQueuePage.jsx — Dynamic Officer Complaint Management Dashboard
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ClipboardList, Search, ArrowRight, Shield, CheckCircle,
  Clock, AlertTriangle, FileText, RefreshCw, Filter, MapPin
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SeverityBadge, UrgencyBadge, StatusBadge, ConfidenceMeter } from '../../components/complaint/Badges';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon: Icon, label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`stat-card text-left group transition-all cursor-pointer ${
        active ? 'ring-2 ring-primary-500 bg-primary-50/20 border-primary-300' : 'hover:border-primary-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-xs`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ArrowRight className={`w-4 h-4 transition-colors ${active ? 'text-primary-600' : 'text-neutral-400 group-hover:text-primary-600'}`} />
      </div>
      <div className="text-3xl font-display font-extrabold text-neutral-900 mt-2">{value}</div>
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</div>
    </button>
  );
}

export default function ReviewQueuePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 15;

  const [summary, setSummary] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    pendingReview: 0,
    resolvedComplaints: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/officer/dashboard', {
        params: { page, limit: LIMIT, filter: activeTab },
      });
      const data = res.data;
      setSummary({
        totalComplaints: data.totalComplaints || 0,
        activeComplaints: data.activeComplaints || 0,
        pendingReview: data.pendingReview || 0,
        resolvedComplaints: data.resolvedComplaints || 0,
        departmentName: data.departmentName || '',
      });
      setComplaints(data.complaints || []);
      setTotal(data.totalFiltered || 0);
    } catch (err) {
      console.error('Failed to load officer dashboard:', err);
      toast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setPage(1);
  };

  const handleRefresh = async () => {
    await fetchDashboard();
    toast('Dashboard & counts refreshed!', 'success');
  };

  const filtered = search
    ? complaints.filter(
        c =>
          c.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.id?.toLowerCase().includes(search.toLowerCase()) ||
          c.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.address_text?.toLowerCase().includes(search.toLowerCase())
      )
    : complaints;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="page-title">Officer Dashboard</h1>
            {summary.departmentName && (
              <span className="badge bg-primary-50 text-primary-800 border-primary-200 font-bold px-2.5 py-1 text-xs rounded-lg">
                🏛 {summary.departmentName}
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm font-medium">
            Monitoring & managing complaints strictly assigned to {summary.departmentName || 'your department'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Complaints"
          value={loading ? '...' : summary.totalComplaints}
          color="bg-primary-600"
          active={activeTab === 'all'}
          onClick={() => handleTabChange('all')}
        />
        <StatCard
          icon={Clock}
          label="Active Complaints"
          value={loading ? '...' : summary.activeComplaints}
          color="bg-blue-600"
          active={activeTab === 'active'}
          onClick={() => handleTabChange('active')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Review"
          value={loading ? '...' : summary.pendingReview}
          color="bg-amber-500"
          active={activeTab === 'needs_review'}
          onClick={() => handleTabChange('needs_review')}
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved Complaints"
          value={loading ? '...' : summary.resolvedComplaints}
          color="bg-emerald-600"
          active={activeTab === 'resolved'}
          onClick={() => handleTabChange('resolved')}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange('needs_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'needs_review'
                ? 'bg-white text-amber-700 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pending Review ({summary.pendingReview})
          </button>
          <button
            onClick={() => handleTabChange('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-white text-blue-700 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Active ({summary.activeComplaints})
          </button>
          <button
            onClick={() => handleTabChange('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'resolved'
                ? 'bg-white text-emerald-700 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Resolved ({summary.resolvedComplaints})
          </button>
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-primary-700 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All ({summary.totalComplaints})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by ID, title, citizen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full text-xs"
          />
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary-600" />
            {activeTab === 'needs_review'
              ? 'Complaints Requiring Officer Action'
              : activeTab === 'active'
              ? 'Active Complaints Under Resolution'
              : activeTab === 'resolved'
              ? 'Resolved Municipal Complaints'
              : 'All Municipal Complaints'}
          </h2>
          <span className="text-xs text-neutral-500 font-medium">Showing {filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>ID & Title</th>
                <th>Category</th>
                <th>Citizen</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <TableSkeleton rows={8} cols={8} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={ClipboardList}
                      title="No complaints found"
                      description={`No complaints match the filter "${activeTab}".`}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td>
                      <span className="text-[11px] font-mono font-semibold text-neutral-400 block">
                        #{c.id?.slice(0, 8)}
                      </span>
                      <div className="font-bold text-neutral-900 max-w-xs truncate">{c.title}</div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-neutral-700 capitalize">
                        {c.issue_category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-neutral-900">{c.users?.full_name || 'Citizen'}</div>
                      <div className="text-[11px] text-neutral-400 font-medium">{c.users?.email}</div>
                    </td>
                    <td>
                      <div className="text-xs text-neutral-600 max-w-xs truncate flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        {c.address_text || 'GPS Coordinates'}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {c.severity && <SeverityBadge severity={c.severity} />}
                        {c.urgency && <UrgencyBadge urgency={c.urgency} />}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/review-queue/${c.id}`}
                        className="btn-primary btn-xs inline-flex items-center gap-1 font-bold"
                      >
                        Review / Action <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
