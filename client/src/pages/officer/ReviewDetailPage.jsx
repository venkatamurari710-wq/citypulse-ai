// client/src/pages/officer/ReviewDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, GitMerge, AlertTriangle, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import AIResultPanel from '../../components/complaint/AIResultPanel';
import { StatusBadge, SeverityBadge, UrgencyBadge } from '../../components/complaint/Badges';
import MapPreview from '../../components/map/MapPreview';
import { PageLoader } from '../../components/shared/LoadingSpinner';
import { format } from 'date-fns';

export default function ReviewDetailPage() {
  const { complaintId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assign'); // assign | override | merge
  const [submitting, setSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({ department_id: '', status: 'assigned', public_message: '', assignment_reason: '', eta: '' });
  const [overrideForm, setOverrideForm] = useState({ override_reason: '', severity: '', urgency: '', department_id: '', status: '', public_message: '' });
  const [mergeForm, setMergeForm] = useState({ root_complaint_id: '', relation_type: 'duplicate' });

  useEffect(() => {
    async function load() {
      try {
        const [compRes, deptRes] = await Promise.all([
          api.get(`/complaints/${complaintId}`),
          api.get('/departments'),
        ]);
        setComplaint(compRes.data.complaint);
        setDepartments(deptRes.data.departments || []);
        setAssignForm(p => ({ ...p, department_id: compRes.data.complaint.department_id || '' }));
      } catch {
        toast('Complaint not found', 'error');
        navigate('/review-queue');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [complaintId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/review-queue/${complaintId}/assign`, assignForm);
      toast('Complaint assigned successfully!', 'success');
      navigate('/review-queue');
    } catch (err) {
      toast(err.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!overrideForm.override_reason) return toast('Override reason is required', 'error');
    setSubmitting(true);
    try {
      const payload = {};
      Object.entries(overrideForm).forEach(([k, v]) => { if (v) payload[k] = v; });
      await api.post(`/review-queue/${complaintId}/override`, payload);
      toast('AI recommendation overridden!', 'success');
      navigate('/review-queue');
    } catch (err) {
      toast(err.response?.data?.error || 'Override failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    if (!mergeForm.root_complaint_id) return toast('Root complaint ID is required', 'error');
    setSubmitting(true);
    try {
      await api.post(`/review-queue/${complaintId}/merge`, mergeForm);
      toast('Complaints merged!', 'success');
      navigate('/review-queue');
    } catch (err) {
      toast(err.response?.data?.error || 'Merge failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!complaint) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      <Link to="/review-queue" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Review Queue
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-neutral-900">{complaint.title}</h1>
          <p className="text-neutral-500 text-sm font-medium mt-1">Submitted by {complaint.users?.full_name} · {format(new Date(complaint.created_at), 'MMM d, yyyy HH:mm')}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={complaint.status} />
          {complaint.severity && <SeverityBadge severity={complaint.severity} />}
          {complaint.urgency && <UrgencyBadge urgency={complaint.urgency} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: complaint info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="section-title mb-3">Description</h2>
            <p className="text-neutral-700 leading-relaxed font-normal">{complaint.description}</p>
            {complaint.address_text && (
              <p className="text-xs font-semibold text-neutral-500 mt-3 flex items-center gap-1">
                📍 {complaint.address_text}
              </p>
            )}
          </div>
          <AIResultPanel complaint={complaint} />
          {complaint.latitude && complaint.longitude && (
            <MapPreview latitude={parseFloat(complaint.latitude)} longitude={parseFloat(complaint.longitude)} address={complaint.address_text} height="200px" />
          )}
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-neutral-200/60 p-1 rounded-xl">
            {[
              { id: 'assign', icon: Building2, label: 'Assign' },
              { id: 'override', icon: AlertTriangle, label: 'Override' },
              { id: 'merge', icon: GitMerge, label: 'Merge' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === t.id ? 'bg-white text-primary-700 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {/* Assign form */}
          {tab === 'assign' && (
            <form onSubmit={handleAssign} className="card p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-neutral-900 text-sm">Assign Complaint</h3>
              <div className="form-field">
                <label>Department *</label>
                <select required value={assignForm.department_id} onChange={e => setAssignForm(p => ({ ...p, department_id: e.target.value }))}>
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={assignForm.status} onChange={e => setAssignForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
              <div className="form-field">
                <label>Assignment Reason</label>
                <input type="text" value={assignForm.assignment_reason} onChange={e => setAssignForm(p => ({ ...p, assignment_reason: e.target.value }))} placeholder="Optional reason..." />
              </div>
              <div className="form-field">
                <label>Public Message to Citizen</label>
                <textarea value={assignForm.public_message} onChange={e => setAssignForm(p => ({ ...p, public_message: e.target.value }))} rows={3} className="resize-none" placeholder="Message visible to citizen..." />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                <Check className="w-4 h-4" /> {submitting ? 'Assigning...' : 'Assign Complaint'}
              </button>
            </form>
          )}

          {/* Override form */}
          {tab === 'override' && (
            <form onSubmit={handleOverride} className="card p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-neutral-900 text-sm">Override AI Decision</h3>
              <div className="form-field">
                <label>Override Reason *</label>
                <textarea required value={overrideForm.override_reason} onChange={e => setOverrideForm(p => ({ ...p, override_reason: e.target.value }))} rows={3} className="resize-none" placeholder="Explain why you're overriding the AI decision..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-field">
                  <label>Severity</label>
                  <select value={overrideForm.severity} onChange={e => setOverrideForm(p => ({ ...p, severity: e.target.value }))}>
                    <option value="">Keep current</option>
                    {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Urgency</label>
                  <select value={overrideForm.urgency} onChange={e => setOverrideForm(p => ({ ...p, urgency: e.target.value }))}>
                    <option value="">Keep current</option>
                    {['low','medium','high','immediate'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Reassign Department</label>
                <select value={overrideForm.department_id} onChange={e => setOverrideForm(p => ({ ...p, department_id: e.target.value }))}>
                  <option value="">Keep current</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Public Message</label>
                <textarea value={overrideForm.public_message} onChange={e => setOverrideForm(p => ({ ...p, public_message: e.target.value }))} rows={2} className="resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="btn-danger w-full">
                {submitting ? 'Overriding...' : 'Apply Override'}
              </button>
            </form>
          )}

          {/* Merge form */}
          {tab === 'merge' && (
            <form onSubmit={handleMerge} className="card p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-neutral-900 text-sm">Merge as Duplicate</h3>
              <div className="form-field">
                <label>Root Complaint ID *</label>
                <input type="text" required value={mergeForm.root_complaint_id} onChange={e => setMergeForm(p => ({ ...p, root_complaint_id: e.target.value }))} placeholder="UUID of original complaint" />
              </div>
              <div className="form-field">
                <label>Relation Type</label>
                <select value={mergeForm.relation_type} onChange={e => setMergeForm(p => ({ ...p, relation_type: e.target.value }))}>
                  <option value="duplicate">Duplicate</option>
                  <option value="same_location">Same Location</option>
                  <option value="same_issue">Same Issue</option>
                  <option value="follow_up">Follow-Up</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="btn-ghost w-full">
                <GitMerge className="w-4 h-4" /> {submitting ? 'Merging...' : 'Merge Complaints'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
