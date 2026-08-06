// client/src/pages/admin/AdminDepartmentsPage.jsx
import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from '../../components/shared/EmptyState';

const EMPTY_FORM = { name: '', description: '', jurisdiction_area: '', contact_email: '', contact_phone: '', active: true };

export default function AdminDepartmentsPage() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments || []);
    } catch { toast('Failed to load departments', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (d) => { setEditId(d.id); setForm({ name: d.name, description: d.description || '', jurisdiction_area: d.jurisdiction_area || '', contact_email: d.contact_email || '', contact_phone: d.contact_phone || '', active: d.active }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/departments/${editId}`, form);
        toast('Department updated!', 'success');
      } else {
        await api.post('/departments', form);
        toast('Department created!', 'success');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Action failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast('Department deleted', 'success');
      load();
    } catch { toast('Delete failed', 'error'); }
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Department Management</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Create and configure city department structures and contact endpoints</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Department</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg animate-slide-up shadow-card-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">{editId ? 'Edit' : 'Create'} Department</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field"><label>Name *</label><input required value={form.name} onChange={set('name')} placeholder="Roads & Infrastructure" /></div>
              <div className="form-field"><label>Description</label><textarea value={form.description} onChange={set('description')} rows={2} className="resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-field"><label>Contact Email</label><input type="email" value={form.contact_email} onChange={set('contact_email')} /></div>
                <div className="form-field"><label>Contact Phone</label><input type="tel" value={form.contact_phone} onChange={set('contact_phone')} /></div>
              </div>
              <div className="form-field"><label>Jurisdiction Area</label><input value={form.jurisdiction_area} onChange={set('jurisdiction_area')} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={set('active')} className="w-4 h-4 accent-primary-600 rounded" />
                <span className="text-sm font-semibold text-neutral-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-neutral-500 font-medium">Loading...</div> : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" action={<button onClick={openCreate} className="btn-primary">Add First Department</button>} />
      ) : (
        <div className="card overflow-hidden shadow-sm">
          <table className="table-base">
            <thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="font-bold text-neutral-900">{d.name}</div>
                    {d.description && <div className="text-xs text-neutral-500 font-medium truncate max-w-xs">{d.description}</div>}
                  </td>
                  <td className="text-xs text-neutral-600 font-medium">{d.contact_email || '—'}</td>
                  <td>{d.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-ghost">Inactive</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="btn-ghost btn-sm"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(d.id)} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
