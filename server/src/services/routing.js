// server/src/services/routing.js — Strict Complaint-to-Department Routing Engine
import { supabase } from '../config/supabase.js';
import { routingMap } from './routingMap.js';

/**
 * Validates whether a category maps to the given department name.
 */
export function validateDepartmentMapping(issueCategory, departmentName) {
  const mapEntry = routingMap[issueCategory];
  if (!mapEntry) return false;
  if (departmentName.toLowerCase().includes('review')) return true;
  return mapEntry.departmentName.toLowerCase() === departmentName.toLowerCase();
}

/**
 * Strict Routing Engine: Auto-assigns complaint to canonical department immediately.
 * Ambiguous, low-confidence, or multi-department cases route to Municipal Complaint Review Unit.
 */
export async function routeComplaint({ issue_category, issue_subcategory = '', description = '', confidence = 1.0, review_required = false }) {
  const mapEntry = routingMap[issue_category] || routingMap.unknown;
  const isAmbiguous = (
    issue_category === 'unknown' ||
    issue_category === 'noise_or_nuisance' ||
    issue_category === 'public_safety_hazards' ||
    confidence < 0.75 ||
    review_required === true
  );

  const targetDeptName = isAmbiguous ? 'Municipal Complaint Review Unit' : mapEntry.departmentName;
  const officerTitle = isAmbiguous ? 'Municipal Complaint Review Officer' : mapEntry.officerTitle;

  // Query database for matching department ID
  const { data: dept } = await supabase
    .from('departments')
    .select('id, name')
    .ilike('name', `%${targetDeptName}%`)
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (dept) {
    return {
      department_id: dept.id,
      department_name: dept.name,
      officer_title: officerTitle,
      assignment_reason: isAmbiguous
        ? `Routed to Review Unit due to category "${issue_category}" or confidence (${Math.round(confidence * 100)}%)`
        : `Auto-routed to ${dept.name} per strict routing matrix for category "${issue_category}"`,
      review_required: isAmbiguous,
    };
  }

  // Fallback if specific department name isn't seeded yet — route to review unit queue
  const { data: fallbackDept } = await supabase
    .from('departments')
    .select('id, name')
    .ilike('name', '%Review%')
    .limit(1)
    .maybeSingle();

  return {
    department_id: fallbackDept?.id || null,
    department_name: fallbackDept?.name || 'Municipal Complaint Review Unit',
    officer_title: 'Municipal Complaint Review Officer',
    assignment_reason: `Primary department "${targetDeptName}" queued for review`,
    review_required: true,
  };
}
