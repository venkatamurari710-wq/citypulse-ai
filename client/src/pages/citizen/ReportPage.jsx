import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import FileUploadZone from '../../components/complaint/FileUploadZone';
import { detectCategory } from '../../services/categoryDetector';

const CATEGORIES = [
  { value: 'roads_and_potholes', label: '🛣 Roads & Potholes' },
  { value: 'garbage_and_sanitation', label: '🗑 Garbage & Sanitation' },
  { value: 'water_leakage', label: '💧 Water Leakage' },
  { value: 'sewage_overflow', label: '🌊 Sewage Overflow' },
  { value: 'streetlight_failure', label: '💡 Streetlight Failure' },
  { value: 'electrical_hazards', label: '⚡ Electrical Hazards' },
  { value: 'illegal_dumping', label: '🚯 Illegal Dumping' },
  { value: 'fallen_trees_and_debris', label: '🌲 Fallen Trees & Debris' },
  { value: 'drainage_blockage', label: '🚰 Drainage Blockage' },
  { value: 'public_infrastructure_damage', label: '🏗 Infrastructure Damage' },
  { value: 'traffic_signal_failure', label: '🚦 Traffic Signal Failure' },
  { value: 'public_safety_hazards', label: '⚠ Public Safety Hazards' },
  { value: 'flooding_and_waterlogging', label: '🌧 Flooding & Waterlogging' },
  { value: 'noise_or_nuisance', label: '📢 Noise or Nuisance' },
];

export default function ReportPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_hint: '',
    address_text: '',
    latitude: '',
    longitude: '',
    urgency_flagged_by_citizen: false,
    consent_for_followup: true,
    tags: [],
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [isManuallySet, setIsManuallySet] = useState(false);

  // Background AI Category Auto-Selection (400ms debounce)
  useEffect(() => {
    if (!form.title.trim() && !form.description.trim()) {
      setIsManuallySet(false);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await detectCategory(form.title, form.description);
      if (res.confidence >= 0.70 && res.category) {
        if (!isManuallySet) {
          setForm(p => ({ ...p, category_hint: res.category }));
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.title, form.description, isManuallySet]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (field === 'category_hint') {
      setIsManuallySet(true);
    }
    setForm(p => ({ ...p, [field]: val }));
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) return toast('Geolocation not supported', 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }));
        toast('Location captured!', 'success');
        setLocating(false);
      },
      () => { toast('Could not get location. Please enter manually.', 'warning'); setLocating(false); }
    );
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.title.trim() || form.title.length < 5) {
      return setErrors({ title: 'Title must be at least 5 characters' });
    }
    if (!form.description.trim() || form.description.length < 10) {
      return setErrors({ description: 'Description must be at least 10 characters' });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          formData.append(k, typeof v === 'boolean' ? String(v) : v);
        }
      });
      formData.set('tags', JSON.stringify(form.tags));
      files.forEach(f => formData.append('files', f));

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast('Complaint submitted! AI is analyzing your report.', 'success');
      navigate(`/complaints/${res.data.complaint.id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const errs = {};
        data.details.forEach(d => { errs[d.field] = d.message; });
        setErrors(errs);
      }
      toast(data?.error || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">Report a Civic Issue</h1>
        <p className="text-neutral-500 text-sm mt-1 font-medium">Provide as much detail as possible. AI will analyze and route your report.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Issue Details</h2>

          <div className="form-field">
            <label htmlFor="title">Complaint Title *</label>
            <input id="title" type="text" value={form.title} onChange={set('title')} placeholder="e.g., Large pothole on Main Street near park entrance" maxLength={200} />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the issue in detail. When did it start? How severe is it? Is it causing danger?"
              rows={4}
              maxLength={5000}
              className="resize-none"
            />
            <div className="flex justify-between">
              {errors.description && <p className="field-error">{errors.description}</p>}
              <span className="text-xs text-neutral-400 ml-auto font-medium">{form.description.length}/5000</span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="category_hint">Category Hint (optional)</label>
            <select id="category_hint" value={form.category_hint} onChange={set('category_hint')}>
              <option value="">Let AI decide automatically</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              id="urgency_flag"
              type="checkbox"
              checked={form.urgency_flagged_by_citizen}
              onChange={set('urgency_flagged_by_citizen')}
              className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
            />
            <label htmlFor="urgency_flag" className="text-sm text-neutral-700 cursor-pointer">
              <span className="font-bold text-neutral-900">⚡ Mark as Urgent</span>
              <br />
              <span className="text-neutral-500 font-normal">Flag this if the issue poses immediate safety risk</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Location Information</h2>
          <div className="form-field">
            <label htmlFor="address_text">Address or Landmark</label>
            <input id="address_text" type="text" value={form.address_text} onChange={set('address_text')} placeholder="e.g., 123 Main St, near City Hall" />
          </div>
          <button type="button" onClick={getLocation} disabled={locating} className="btn-ghost flex items-center gap-2">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-primary-600" />}
            {locating ? 'Capturing GPS...' : 'Use Current GPS Location'}
          </button>
        </div>

        {/* Media uploads */}
        <div className="card p-6 space-y-3">
          <h2 className="section-title">Attach Evidence</h2>
          <p className="text-sm text-neutral-500 font-medium">Upload photos, videos, voice notes, or documents. Gemini AI will analyze all attachments.</p>
          <FileUploadZone files={files} onChange={setFiles} maxFiles={10} />
        </div>

        {/* Consent */}
        <div className="card p-4 bg-neutral-50">
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              checked={form.consent_for_followup}
              onChange={set('consent_for_followup')}
              className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
            />
            <label htmlFor="consent" className="text-xs text-neutral-600 font-medium cursor-pointer">
              I consent to be contacted by municipal officers regarding follow-up actions for this complaint.
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-primary btn-lg">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting & Analyzing...</>
            ) : (
              'Submit Complaint'
            )}
          </button>
          {loading && (
            <p className="text-sm text-neutral-500 font-semibold animate-pulse">AI is processing your complaint...</p>
          )}
        </div>

        {loading && (
          <div className="card border-primary-200 bg-primary-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">AI Analysis in Progress</p>
                <p className="text-xs text-neutral-600">Gemini AI is classifying your issue, checking spatial duplicates, and routing to the right department...</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
