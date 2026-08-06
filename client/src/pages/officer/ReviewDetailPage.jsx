// client/src/pages/officer/ReviewDetailPage.jsx — Officer Action Center
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, AlertTriangle, Building2, Clock, Upload,
  FileText, ShieldCheck, Sparkles, AlertOctagon, CheckCircle2,
  XCircle, Send, MapPin, User, Calendar, Image as ImageIcon,
  Paperclip, Tag, Lock, Eye, Activity
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { StatusBadge, SeverityBadge, UrgencyBadge } from '../../components/complaint/Badges';
import MapPreview from '../../components/map/MapPreview';
import { PageLoader } from '../../components/shared/LoadingSpinner';
import { format } from 'date-fns';

export default function ReviewDetailPage() {
  const { complaintId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Form State for Officer Action Center
  const [form, setForm] = useState({
    status: 'needs_review',
    priority: 'medium',
    urgency: 'medium',
    etaPreset: '24 Hours',
    customEta: '',
    internal_notes: '',
    public_message: '',
    resolution_summary: '',
    confirmCompletion: false,
  });

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  async function fetchComplaint() {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${complaintId}`);
      const comp = res.data.complaint;
      setComplaint(comp);
      setForm(prev => ({
        ...prev,
        status: comp.status || 'needs_review',
        priority: comp.severity || 'medium',
        urgency: comp.urgency || 'medium',
        resolution_summary: comp.ai_summary || '',
      }));
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load complaint details', 'error');
      navigate('/review-queue');
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + evidenceFiles.length > 5) {
      toast('Maximum 5 evidence files allowed', 'warning');
      return;
    }
    setEvidenceFiles(prev => [...prev, ...selected]);
  };

  const removeEvidenceFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const computeEtaTimestamp = () => {
    const now = new Date();
    switch (form.etaPreset) {
      case 'Today':
        now.setHours(23, 59, 59);
        return now.toISOString();
      case '24 Hours':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case '2 Days':
        return new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
      case '3 Days':
        return new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
      case '1 Week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'Custom Date':
        return form.customEta ? new Date(form.customEta).toISOString() : null;
      default:
        return null;
    }
  };

  const submitOfficerAction = async (targetStatus, actionType = 'save') => {
    // Resolution Validation
    if (targetStatus === 'resolved' || actionType === 'mark_resolved') {
      if (!form.resolution_summary || form.resolution_summary.trim() === '') {
        toast('Please enter a Resolution Summary before marking as resolved.', 'error');
        return;
      }
    }

    if (targetStatus === 'rejected' && (!form.public_message || form.public_message.trim() === '')) {
      toast('Please enter a Citizen Update Message explaining why the complaint is being rejected.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', targetStatus || form.status);
      formData.append('priority', form.priority);
      formData.append('severity', form.priority);
      formData.append('urgency', form.urgency);
      formData.append('eta', computeEtaTimestamp() || '');
      formData.append('internal_notes', form.internal_notes);
      formData.append('public_message', form.public_message);
      formData.append('resolution_summary', form.resolution_summary);
      formData.append('action_type', actionType);

      evidenceFiles.forEach(file => {
        formData.append('files', file);
      });

      const res = await api.post(`/review-queue/${complaintId}/action`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast(res.data.message || 'Officer action saved successfully!', 'success');
      setEvidenceFiles([]);
      await fetchComplaint();

      if (targetStatus === 'resolved' || targetStatus === 'rejected') {
        setTimeout(() => navigate('/review-queue'), 1200);
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update complaint action', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!complaint) return null;

  const deptName = complaint.departments?.name || complaint.assignedDepartment || 'Assigned Department';
  const confidence = Math.round((complaint.confidence || 0.85) * 100);
  const updates = complaint.complaint_updates || [];
  const uploads = complaint.uploads || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-slide-up">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/review-queue"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">ID: {complaint.id.substring(0, 8)}...</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {deptName}
              </span>
            </div>
            <h1 className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
              {complaint.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={complaint.status} />
          {complaint.severity && <SeverityBadge severity={complaint.severity} />}
          {complaint.urgency && <UrgencyBadge urgency={complaint.urgency} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT & CENTER COLUMN (7 COLS): Complaint Details, AI Result, Timeline */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Complaint Description Card */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-primary-500" />
                <span>Submitted by <strong className="text-slate-800 dark:text-slate-200">{complaint.users?.full_name || 'Citizen'}</strong></span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(complaint.created_at), 'MMM d, yyyy HH:mm')}
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint Description</h2>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line text-base">
                {complaint.description}
              </p>
            </div>

            {complaint.address_text && (
              <div className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{complaint.address_text}</span>
              </div>
            )}

            {/* Citizen Uploaded Media */}
            {uploads.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary-500" /> Citizen Attached Files ({uploads.length})
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map(file => (
                    <a
                      key={file.id}
                      href={file.storage_path ? `http://localhost:5000/${file.storage_path.replace(/\\/g, '/')}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center hover:opacity-95 transition-opacity"
                    >
                      {file.file_type === 'image' ? (
                        <img
                          src={file.storage_path ? `http://localhost:5000/${file.storage_path.replace(/\\/g, '/')}` : ''}
                          alt={file.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500 text-xs p-2 text-center">
                          <Paperclip className="w-5 h-5 text-primary-500" />
                          <span className="truncate max-w-full font-medium">{file.file_name}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced AI Triage Result Card */}
          <div className="card p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/90 border border-primary-200/80 dark:border-primary-900/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Classification Result</h2>
                  <p className="text-xs text-slate-500">Automated triage matrix engine</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {confidence}% Confidence
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">AI Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block capitalize">
                  {(complaint.issue_category || 'General Civic Report').replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Assigned Department</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 mt-0.5 block">
                  {deptName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Severity & Urgency</span>
                <div className="flex items-center gap-2 mt-1">
                  <SeverityBadge severity={complaint.severity || 'medium'} />
                  <UrgencyBadge urgency={complaint.urgency || 'medium'} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Priority Weight</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  High Priority Triage (Auto-Mapped)
                </span>
              </div>
            </div>

            {/* AI Explanation / Summary */}
            {complaint.ai_summary && (
              <div className="mt-4 p-3.5 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/60 dark:border-primary-900/40 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <strong className="text-primary-700 dark:text-primary-400 block mb-1">AI Recommendation Summary:</strong>
                {complaint.ai_summary}
              </div>
            )}
          </div>

          {/* Map Preview Component */}
          {complaint.latitude && complaint.longitude && (
            <div className="card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" /> Geographic Coordinates & Location Map
              </h3>
              <MapPreview
                latitude={parseFloat(complaint.latitude)}
                longitude={parseFloat(complaint.longitude)}
                address={complaint.address_text}
                height="220px"
              />
            </div>
          )}

          {/* Visual Interactive Lifecycle Timeline */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-5 h-5 text-primary-500" /> Complaint Progress Lifecycle & Timeline
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1: Submission */}
              <div className="relative group">
                <div className="absolute -left-[23px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Complaint Submitted</span>
                    <span className="text-slate-400">{format(new Date(complaint.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Filed by citizen ({complaint.users?.full_name || 'Citizen'})</p>
                </div>
              </div>

              {/* Step 2: AI Classification & Auto Routing */}
              <div className="relative group">
                <div className="absolute -left-[23px] top-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">AI Categorized & Auto-Assigned</span>
                    <span className="text-slate-400">{format(new Date(complaint.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categorized as <strong>{complaint.issue_category || 'Report'}</strong> ({confidence}% confidence) & assigned to <strong>{deptName}</strong>.
                  </p>
                </div>
              </div>

              {/* Timeline Updates from database */}
              {updates.map((update, idx) => (
                <div key={update.id || idx} className="relative group">
                  <div className={`absolute -left-[23px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                    update.status === 'resolved' || update.status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : update.status === 'in_progress' || update.status === 'work_scheduled'
                      ? 'bg-blue-500 text-white'
                      : update.status === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {update.status === 'resolved' ? '✓' : update.status === 'in_progress' ? '⚡' : '•'}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                        {update.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400">{format(new Date(update.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                    {update.message && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{update.message}</p>}
                    {update.public_message && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 italic mt-1 bg-primary-50/40 dark:bg-primary-950/30 p-2 rounded-lg border border-primary-200/50 dark:border-primary-900/30">
                        "{update.public_message}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (5 COLS): Replaced Officer Action Panel */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 sticky top-20">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-500" /> Officer Action Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage complaint progression & resolution</p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* 1. Assigned Department (Read Only) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Department</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary-500" /> {deptName}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3" /> Auto-Assigned
              </span>
            </div>

            {/* 2. Current Status Dropdown */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary-500" /> Update Current Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm"
              >
                <option value="needs_review">Needs Review</option>
                <option value="accepted">Accepted</option>
                <option value="work_scheduled">Work Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_materials">Waiting for Materials</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* 3. Priority & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Priority / Severity</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Emergency / Critical</option>
                </select>
              </div>

              <div className="form-field">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Resolution Urgency</label>
                <select
                  value={form.urgency}
                  onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>
            </div>

            {/* 4. Estimated Resolution Time (ETA) */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Estimated Resolution Time (ETA)
              </label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['Today', '24 Hours', '2 Days', '3 Days', '1 Week', 'Custom Date'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, etaPreset: preset }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                      form.etaPreset === preset
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {form.etaPreset === 'Custom Date' && (
                <input
                  type="date"
                  value={form.customEta}
                  onChange={e => setForm(p => ({ ...p, customEta: e.target.value }))}
                  className="w-full mt-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
                />
              )}
            </div>

            {/* 5. Internal Officer Notes */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-500" /> Internal Officer Notes (Private Audit)
              </label>
              <textarea
                value={form.internal_notes}
                onChange={e => setForm(p => ({ ...p, internal_notes: e.target.value }))}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 resize-none"
                placeholder="Notes visible only to department officers and system admins..."
              />
            </div>

            {/* 6. Citizen Update Message */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-500" /> Citizen Public Message
              </label>
              <textarea
                value={form.public_message}
                onChange={e => setForm(p => ({ ...p, public_message: e.target.value }))}
                rows={2}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 resize-none"
                placeholder='e.g., "Our maintenance crew will inspect the road tomorrow morning."'
              />
            </div>

            {/* 7. Upload Work Evidence */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-500" /> Upload Work Completion Evidence
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Click to attach completion photos / videos / PDF
                </span>
                <span className="text-[11px] text-slate-400">Before & After photos, work receipts (Max 5 files)</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {evidenceFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {evidenceFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-xs">
                      <span className="truncate max-w-[200px] font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                      <button type="button" onClick={() => removeEvidenceFile(i)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Resolution Summary */}
            <div className="form-field">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolution Summary (Required for Resolution)
              </label>
              <textarea
                value={form.resolution_summary}
                onChange={e => setForm(p => ({ ...p, resolution_summary: e.target.value }))}
                rows={3}
                className="w-full bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-300/60 dark:border-emerald-900 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 resize-none"
                placeholder='e.g., "Potholes filled with asphalt, road surface compacted and inspected by team."'
              />
            </div>

            {/* 9. Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitOfficerAction(form.status, 'save')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-slate-500" /> {submitting ? 'Saving...' : 'Save Progress'}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitOfficerAction('in_progress', 'mark_in_progress')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4" /> {submitting ? 'Updating...' : 'Mark In Progress'}
                </button>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => submitOfficerAction('resolved', 'mark_resolved')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> {submitting ? 'Resolving...' : 'Mark Complaint as Resolved'}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => submitOfficerAction('rejected', 'reject')}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Complaint
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
