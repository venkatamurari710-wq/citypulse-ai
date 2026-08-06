// client/src/pages/citizen/ComplaintsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import api from '../../services/api';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/shared/LoadingSpinner';

const STATUSES = ['pending', 'analyzing', 'needs_review', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function ComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const LIMIT = 12;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { page, limit: LIMIT };
        if (status) params.status = status;
        const res = await api.get('/complaints/my', { params });
        setComplaints(res.data.complaints || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, status]);

  const setStatus = (s) => {
    const p = new URLSearchParams(searchParams);
    if (s) p.set('status', s); else p.delete('status');
    p.set('page', '1');
    setSearchParams(p);
  };

  const filtered = search
    ? complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.issue_category?.includes(search.toLowerCase()))
    : complaints;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Complaints</h1>
        <span className="badge badge-ghost font-bold">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setStatus('')} className={`btn btn-sm ${!status ? 'btn-primary' : 'btn-ghost'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No complaints found" description="Try adjusting your filters or submit a new complaint." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}

      <Pagination
        page={page}
        limit={LIMIT}
        total={total}
        onPageChange={p => {
          const params = new URLSearchParams(searchParams);
          params.set('page', p);
          setSearchParams(params);
        }}
      />
    </div>
  );
}
