// client/src/pages/admin/AdminComplaintsPage.jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, SeverityBadge } from '../../components/complaint/Badges';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import { formatDistanceToNow } from 'date-fns';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const LIMIT = 25;

  useEffect(() => {
    setLoading(true);
    api.get('/admin/complaints', { params: { page, limit: LIMIT, status: status || undefined, search: search || undefined } })
      .then(res => { setComplaints(res.data.complaints || []); setTotal(res.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Global Complaints Directory</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Complete record of all citizen complaints submitted across all departments</p>
        </div>
        <span className="badge badge-ghost font-bold">{total} total</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPage(1)} className="pl-10 w-full" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-44">
          <option value="">All Statuses</option>
          {['pending','analyzing','needs_review','assigned','in_progress','resolved','closed'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden shadow-sm">
        <table className="table-base">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Status</th><th>Severity</th><th>Department</th><th>User</th><th>Filed</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><TableSkeleton rows={8} cols={7} /></td></tr>
            ) : complaints.map(c => (
              <tr key={c.id}>
                <td>
                  <Link to={`/complaints/${c.id}`} className="font-bold text-neutral-900 hover:text-primary-600 transition-colors max-w-xs truncate block">
                    {c.title}
                  </Link>
                </td>
                <td className="text-xs text-neutral-600 font-medium capitalize">{c.issue_category?.replace(/_/g,' ') || '—'}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{c.severity ? <SeverityBadge severity={c.severity} /> : '—'}</td>
                <td className="text-xs text-neutral-600 font-semibold">{c.departments?.name || '—'}</td>
                <td className="text-xs text-neutral-500 font-medium">{c.users?.full_name || '—'}</td>
                <td className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
