// client/src/pages/admin/RoutingRulesPage.jsx
import { useState, useEffect } from 'react';
import { GitBranch, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from '../../components/shared/EmptyState';

const CATEGORIES = [
  'roads_and_potholes','garbage_and_sanitation','water_leakage','sewage_overflow',
  'streetlight_failure','electrical_hazards','illegal_dumping','fallen_trees_and_debris',
  'drainage_blockage','public_infrastructure_damage','traffic_signal_failure',
  'public_safety_hazards','flooding_and_waterlogging','noise_or_nuisance','unknown',
];

const EMPTY = { issue_category: '', issue_subcategory: '', department_id: '', priority_weight: 0, keywords: [], active: true };

export default function RoutingRulesPage() {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [kwInput, setKwInput] = useState('');

  async function load() {
    try {
      const [rulesRes, deptsRes] = await Promise.all([
        api.get('/routing-rules'),
        api.get('/departments'),
      ]);
      setRules(rulesRes.data.rules || []);
      setDepartments(deptsRes.data.departments || []);
    } catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setKwInput(''); setShowForm(true); };
  const openEdit = (r) => {
    setEditId(r.id);
    setForm({ issue_category: r.issue_category, issue_subcategory: r.issue_subcategory || '', department_id: r.department_id, priority_weight: r.priority_weight, keywords: r.keywords || [], active: r.active });
    setKwInput('');
    setShowForm(true);
  };

  const addKeyword = () => {
    if (kwInput.trim() && !form.keywords.includes(kwInput.trim())) {
      setForm(p => ({ ...p, keywords: [...p.keywords, kwInput.trim()] }));
      setKwInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/routing-rules/${editId}`, form);
      else await api.post('/routing-rules', form);
      toast(editId ? 'Rule updated!' : 'Rule created!', 'success');
      setShowForm(false);
      load();
    } catch (err) { toast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try { await api.delete(`/routing-rules/${id}`); toast('Deleted', 'success'); load(); }
    catch { toast('Delete failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Automated Routing Rules</h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">Map complaint categories and keywords directly to target departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Rule</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto shadow-card-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">{editId ? 'Edit' : 'Create'} Routing Rule</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-neutral-400 hover:text-neutral-700" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <label>Issue Category *</label>
                <select required value={form.issue_category} onChange={e => setForm(p => ({ ...p, issue_category: e.target.value }))}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Target Department *</label>
                <select required value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Subcategory</label>
                <input value={form.issue_subcategory} onChange={e => setForm(p => ({ ...p, issue_subcategory: e.target.value }))} placeholder="e.g., pothole" />
              </div>
              <div className="form-field">
                <label>Priority Weight (0-100)</label>
                <input type="number" min={0} max={100} value={form.priority_weight} onChange={e => setForm(p => ({ ...p, priority_weight: parseInt(e.target.value) }))} />
              </div>
              <div className="form-field">
                <label>Matching Keywords</label>
                <div className="flex gap-2">
                  <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())} placeholder="Add keyword..." className="flex-1" />
                  <button type="button" onClick={addKeyword} className="btn-ghost px-3">Add</button>
                </div>
                {form.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.keywords.map(kw => (
                      <span key={kw} className="badge badge-ghost flex items-center gap-1 font-semibold">
                        {kw}
                        <button type="button" onClick={() => setForm(p => ({ ...p, keywords: p.keywords.filter(k => k !== kw) }))}>
                          <X className="w-3 h-3 text-neutral-400 hover:text-neutral-700" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-primary-600 rounded" />
                <span className="text-sm font-semibold text-neutral-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1"><Check className="w-4 h-4" /> Save Rule</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className="text-neutral-500 font-medium">Loading...</p> : rules.length === 0 ? (
        <EmptyState icon={GitBranch} title="No routing rules" description="Add rules to automatically route complaints to departments." action={<button onClick={openCreate} className="btn-primary">Add First Rule</button>} />
      ) : (
        <div className="card overflow-hidden shadow-sm">
          <table className="table-base">
            <thead><tr><th>Category</th><th>Department</th><th>Priority</th><th>Keywords</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td className="text-sm font-bold text-neutral-900 capitalize">{r.issue_category?.replace(/_/g,' ')}{r.issue_subcategory && ` › ${r.issue_subcategory}`}</td>
                  <td className="text-sm font-semibold text-primary-700">{r.departments?.name || '—'}</td>
                  <td className="text-sm text-neutral-600 font-medium">{r.priority_weight}</td>
                  <td><div className="flex flex-wrap gap-1">{(r.keywords || []).slice(0,3).map(k => <span key={k} className="badge badge-ghost text-xs">{k}</span>)}{r.keywords?.length > 3 && <span className="text-xs text-neutral-400 font-medium">+{r.keywords.length - 3}</span>}</div></td>
                  <td>{r.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-ghost">Off</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="btn-ghost btn-sm"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(r.id)} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
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
