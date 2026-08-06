// client/src/pages/officer/ReviewQueuePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { SeverityBadge, UrgencyBadge, ConfidenceMeter } from '../../components/complaint/Badges';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewQueuePage() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/review-queue', { params: { page, limit: LIMIT } });
        setComplaints(res.data.complaints || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  const filtered = search
    ? complaints.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
    : complaints;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Officer Review Queue</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Complaints requiring officer review, manual triage, and department assignment</p>
        </div>
        <span className="badge badge-warning border font-bold">{total} pending</span>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input type="text" placeholder="Search queue..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-full" />
      </div>

      <div className="card overflow-hidden shadow-sm">
        <table className="table-base">
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Urgency</th>
              <th>AI Confidence</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><TableSkeleton rows={8} cols={7} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={ClipboardList} title="Review Queue is empty" description="All complaints have been assigned or processed." /></td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="font-bold text-neutral-900 max-w-xs truncate">{c.title}</div>
                    <div className="text-xs text-neutral-500 font-medium">{c.users?.full_name}</div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-neutral-600 capitalize">{c.issue_category?.replace(/_/g, ' ')}</span>
                  </td>
                  <td>{c.severity ? <SeverityBadge severity={c.severity} /> : '—'}</td>
                  <td>{c.urgency ? <UrgencyBadge urgency={c.urgency} /> : '—'}</td>
                  <td className="w-28"><ConfidenceMeter confidence={c.confidence} /></td>
                  <td className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </td>
                  <td>
                    <Link to={`/review-queue/${c.id}`} className="btn-primary btn-sm flex items-center gap-1">
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
