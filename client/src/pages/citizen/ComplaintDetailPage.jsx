// client/src/pages/citizen/ComplaintDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Building2, Paperclip, RefreshCw, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import AIResultPanel from '../../components/complaint/AIResultPanel';
import { StatusBadge, SeverityBadge, UrgencyBadge } from '../../components/complaint/Badges';
import MapPreview from '../../components/map/MapPreview';
import { PageLoader } from '../../components/shared/LoadingSpinner';

const CATEGORY_LABELS = {
  roads_and_potholes: '🛣 Roads & Potholes',
  garbage_and_sanitation: '🗑 Garbage & Sanitation',
  water_leakage: '💧 Water Leakage',
  sewage_overflow: '🌊 Sewage Overflow',
  streetlight_failure: '💡 Streetlight Failure',
  electrical_hazards: '⚡ Electrical Hazards',
  illegal_dumping: '🚯 Illegal Dumping',
  fallen_trees_and_debris: '🌲 Fallen Trees',
  drainage_blockage: '🚰 Drainage Blockage',
  public_infrastructure_damage: '🏗 Infrastructure',
  traffic_signal_failure: '🚦 Traffic Signal',
  public_safety_hazards: '⚠ Safety Hazards',
  flooding_and_waterlogging: '🌧 Flooding',
  noise_or_nuisance: '📢 Noise/Nuisance',
  unknown: '❓ Unknown',
};

export default function ComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user, isOfficer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/complaints/${complaintId}`);
        setComplaint(res.data.complaint);
      } catch (err) {
        toast('Complaint not found.', 'error');
        navigate('/complaints');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [complaintId]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await api.post(`/complaints/${complaintId}/reanalyze`);
      setComplaint(res.data.complaint);
      toast('AI re-analysis complete!', 'success');
    } catch {
      toast('Re-analysis failed.', 'error');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Close this complaint?')) return;
    setClosing(true);
    try {
      await api.post(`/complaints/${complaintId}/close`);
      toast('Complaint closed.', 'success');
      navigate('/complaints');
    } catch {
      toast('Could not close complaint.', 'error');
      setClosing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!complaint) return null;

  const updates = [...(complaint.complaint_updates || [])].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );
  const uploads = complaint.uploads || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <Link to="/complaints" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm font-semibold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-900">{complaint.title}</h1>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              {CATEGORY_LABELS[complaint.issue_category] || 'Uncategorized'} ·{' '}
              Submitted {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={complaint.status} />
            {complaint.severity && <SeverityBadge severity={complaint.severity} />}
            {complaint.urgency && <UrgencyBadge urgency={complaint.urgency} />}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="section-title mb-3">Description</h2>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap font-normal">{complaint.description}</p>
          </div>

          {/* AI Result */}
          <AIResultPanel complaint={complaint} />

          {/* Timeline */}
          {updates.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Status Timeline</h2>
              <div className="space-y-4">
                {updates.map((u, i) => (
                  <div key={u.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${i === 0 ? 'bg-primary-600 ring-4 ring-primary-100' : 'bg-neutral-300'}`} />
                      {i < updates.length - 1 && <div className="w-0.5 flex-1 bg-neutral-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={u.status} />
                        <span className="text-xs font-semibold text-neutral-500">{format(new Date(u.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                      {u.public_message && <p className="text-sm text-neutral-700 font-medium">{u.public_message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploads */}
          {uploads.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-4"><Paperclip className="w-4 h-4 inline mr-2 text-primary-600" />Attachments</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {uploads.map(u => (
                  <div key={u.id} className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 text-center shadow-xs">
                    <div className="text-2xl mb-1">
                      {u.file_type === 'image' ? '🖼' : u.file_type === 'video' ? '🎬' : u.file_type === 'audio' ? '🎙' : '📄'}
                    </div>
                    <p className="text-xs text-neutral-600 font-medium truncate">{u.file_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="card p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Complaint Information</h3>
            {complaint.departments?.name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-700 font-semibold">{complaint.departments.name}</span>
              </div>
            )}
            {complaint.address_text && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-700 font-medium">{complaint.address_text}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-neutral-600 font-medium">{format(new Date(complaint.created_at), 'MMM d, yyyy HH:mm')}</span>
            </div>
            {complaint.urgency_flagged_by_citizen && (
              <div className="badge badge-warning">⚡ Flagged as Urgent by Citizen</div>
            )}
          </div>

          {/* Map */}
          {complaint.latitude && complaint.longitude && (
            <MapPreview latitude={parseFloat(complaint.latitude)} longitude={parseFloat(complaint.longitude)} address={complaint.address_text} height="200px" />
          )}

          {/* Actions */}
          {(complaint.user_id === user?.id || isOfficer) && (
            <div className="card p-4 space-y-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Actions</h3>
              {isOfficer && (
                <button onClick={handleReanalyze} disabled={reanalyzing} className="btn-ghost w-full text-sm">
                  {reanalyzing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Re-analyzing...</> : <><RefreshCw className="w-4 h-4" /> Re-run AI Analysis</>}
                </button>
              )}
              {!['resolved', 'closed'].includes(complaint.status) && complaint.user_id === user?.id && (
                <button onClick={handleClose} disabled={closing} className="btn-danger w-full text-sm">
                  <X className="w-4 h-4" /> Close Complaint
                </button>
              )}
              {isOfficer && (
                <Link to={`/review-queue/${complaintId}`} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                  Open in Review Queue
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
