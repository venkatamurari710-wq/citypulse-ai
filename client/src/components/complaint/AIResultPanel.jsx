// client/src/components/complaint/AIResultPanel.jsx
import { Brain, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SeverityBadge, UrgencyBadge, DuplicateStatusBadge, ConfidenceMeter } from './Badges';

export default function AIResultPanel({ complaint }) {
  const [expanded, setExpanded] = useState(false);
  if (!complaint.issue_category) return null;

  const signals = complaint.ai_observed_signals || {};
  const hasSignals = Object.values(signals).some(arr => arr?.length > 0);

  return (
    <div className="card border-primary-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-primary-100 bg-primary-50/50">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-xs">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-neutral-900">AI Triage Result</h3>
          <p className="text-xs text-neutral-500">Model: {complaint.model_version || 'gemini-1.5-flash'}</p>
        </div>
        {complaint.review_required && (
          <span className="badge badge-warning">Officer Review Required</span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-600">AI Confidence Score</span>
          </div>
          <ConfidenceMeter confidence={complaint.confidence} />
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {complaint.severity && <SeverityBadge severity={complaint.severity} />}
          {complaint.urgency && <UrgencyBadge urgency={complaint.urgency} />}
          {complaint.duplicate_status && <DuplicateStatusBadge status={complaint.duplicate_status} />}
        </div>

        {/* Explanation */}
        {complaint.ai_explanation && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-700 leading-relaxed font-medium">{complaint.ai_explanation}</p>
          </div>
        )}

        {/* Strict Routing & Officer Assignment Details */}
        {(complaint.departments?.name || complaint.ai_raw_response?.parsed?.department) && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Department Routing</span>
              <span className="badge badge-accent text-xs">
                {complaint.departments?.name || complaint.ai_raw_response?.parsed?.department}
              </span>
            </div>
            {complaint.ai_raw_response?.parsed?.officer_title && (
              <p className="text-xs font-semibold text-indigo-950">
                <span className="text-indigo-600 font-bold">Assigned Unit:</span> {complaint.ai_raw_response.parsed.officer_title}
              </p>
            )}
            {complaint.ai_raw_response?.parsed?.assignment_reason && (
              <p className="text-xs text-neutral-600 font-medium">
                <span className="font-semibold text-neutral-700">Reason:</span> {complaint.ai_raw_response.parsed.assignment_reason}
              </p>
            )}
          </div>
        )}

        {/* Recommended actions */}
        {complaint.ai_recommended_actions?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Recommended Actions
            </h4>
            <ul className="space-y-1.5">
              {complaint.ai_recommended_actions.map((a, i) => (
                <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                  <span className="text-primary-600 font-bold mt-0.5">•</span> {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety notes */}
        {complaint.safety_notes?.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-600" /> Safety Notes
            </h4>
            {complaint.safety_notes.map((n, i) => (
              <p key={i} className="text-sm text-rose-800 font-medium">{n}</p>
            ))}
          </div>
        )}

        {/* Precautions */}
        {complaint.ai_precautions?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Precautions
            </h4>
            <ul className="space-y-1">
              {complaint.ai_precautions.map((p, i) => (
                <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">⚠</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-up questions */}
        {complaint.ai_follow_up_questions?.length > 0 && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Officer Follow-Up Questions</h4>
            {complaint.ai_follow_up_questions.map((q, i) => (
              <p key={i} className="text-sm text-indigo-950 font-medium">? {q}</p>
            ))}
          </div>
        )}

        {/* Observed signals — expandable */}
        {hasSignals && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Hide' : 'Show'} AI Signal Analysis
            </button>
            {expanded && (
              <div className="mt-3 space-y-3 animate-fade-in bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                {Object.entries(signals).map(([key, items]) =>
                  items?.length > 0 ? (
                    <div key={key}>
                      <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{key.replace('from_', 'From ')}</p>
                      {items.map((item, i) => (
                        <p key={i} className="text-xs text-neutral-700 pl-3 border-l-2 border-primary-400">→ {item}</p>
                      ))}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
