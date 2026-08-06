// client/src/pages/admin/UsersPage.jsx
import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import { format } from 'date-fns';

const ROLE_COLORS = {
  citizen: 'badge-ghost',
  officer: 'badge-accent',
  department_admin: 'badge-warning',
  super_admin: 'badge-danger',
};

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const LIMIT = 25;

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: LIMIT, search: search || undefined, role: role || undefined } });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, role]);

  const toggleActive = async (id, current) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-active`, { is_active: !current });
      toast(`User ${current ? 'deactivated' : 'activated'}`, 'success');
      load();
    } catch { toast('Action failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Manage platform accounts, role permissions, and access status</p>
        </div>
        <span className="badge badge-ghost font-bold">{total} total</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="pl-10 w-full" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="w-44">
          <option value="">All Roles</option>
          {['citizen','officer','department_admin','super_admin'].map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden shadow-sm">
        <table className="table-base">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><TableSkeleton rows={8} cols={5} /></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="font-bold text-neutral-900">{u.full_name}</div>
                  <div className="text-xs text-neutral-500 font-medium">{u.email}</div>
                </td>
                <td><span className={`badge border ${ROLE_COLORS[u.role]}`}>{u.role?.replace('_',' ')}</span></td>
                <td>{u.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                <td className="text-xs text-neutral-500 font-medium">{u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}</td>
                <td>
                  <button
                    onClick={() => toggleActive(u.id, u.is_active)}
                    className={`btn-sm ${u.is_active ? 'btn-ghost text-rose-600 hover:bg-rose-50' : 'btn-ghost text-emerald-600 hover:bg-emerald-50'}`}
                    title={u.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
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
