// client/src/components/complaint/Badges.jsx
export function SeverityBadge({ severity }) {
  const map = {
    low: 'severity-low',
    medium: 'severity-medium',
    high: 'severity-high',
    critical: 'severity-critical',
  };
  return (
    <span className={`badge ${map[severity] || 'badge-ghost'} border`}>
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  const map = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    immediate: 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse-slow',
  };
  return (
    <span className={`badge border ${map[urgency] || 'badge-ghost'}`}>
      {urgency === 'immediate' ? '⚡ Immediate' : urgency ? urgency.charAt(0).toUpperCase() + urgency.slice(1) : 'Unknown'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    pending: 'Pending',
    analyzing: '🔄 Analyzing',
    needs_review: '👁 Needs Review',
    assigned: 'Assigned',
    in_progress: '🔧 In Progress',
    resolved: '✅ Resolved',
    closed: 'Closed',
  };
  return (
    <span className={`badge border status-${status}`}>
      {labels[status] || status}
    </span>
  );
}

export function DuplicateStatusBadge({ status }) {
  const map = {
    unique: 'badge-success',
    likely_duplicate: 'badge-warning',
    merged: 'badge-ghost',
    unknown: 'badge-ghost',
  };
  const labels = {
    unique: 'Unique',
    likely_duplicate: '⚠ Likely Duplicate',
    merged: 'Merged',
    unknown: 'Unknown',
  };
  return (
    <span className={`badge border ${map[status] || 'badge-ghost'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ConfidenceMeter({ confidence }) {
  const pct = Math.round((confidence || 0) * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-100 border border-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-neutral-600 w-8 text-right">{pct}%</span>
    </div>
  );
}
