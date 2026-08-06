// client/src/components/complaint/ComplaintCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Clock, Paperclip } from 'lucide-react';
import { SeverityBadge, StatusBadge, DuplicateStatusBadge } from './Badges';
import { formatDistanceToNow } from 'date-fns';

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
  public_infrastructure_damage: '🏗 Infrastructure Damage',
  traffic_signal_failure: '🚦 Traffic Signal',
  public_safety_hazards: '⚠ Safety Hazards',
  flooding_and_waterlogging: '🌧 Flooding',
  noise_or_nuisance: '📢 Noise/Nuisance',
  unknown: '❓ Unknown',
};

export default function ComplaintCard({ complaint, linkTo }) {
  const to = linkTo || `/complaints/${complaint.id}`;
  return (
    <Link to={to} className="block card-hover p-5 animate-fade-in group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
            {complaint.title}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
            {CATEGORY_LABELS[complaint.issue_category] || complaint.issue_category || 'Uncategorized'}
          </p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {complaint.severity && <SeverityBadge severity={complaint.severity} />}
        {complaint.duplicate_status && complaint.duplicate_status !== 'unique' && (
          <DuplicateStatusBadge status={complaint.duplicate_status} />
        )}
        {complaint.departments?.name && (
          <span className="badge badge-ghost">{complaint.departments.name}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-100">
        {complaint.address_text && (
          <span className="flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" /> {complaint.address_text}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto shrink-0 font-medium">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
        </span>
        {complaint.uploads?.length > 0 && (
          <span className="flex items-center gap-1 font-medium">
            <Paperclip className="w-3.5 h-3.5 text-neutral-400" /> {complaint.uploads.length}
          </span>
        )}
      </div>
    </Link>
  );
}
