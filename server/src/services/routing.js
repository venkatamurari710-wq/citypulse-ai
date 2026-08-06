// server/src/services/routing.js — Strict Complaint-to-Department Routing Engine
import { supabase } from '../config/supabase.js';
import { routingMap, getDepartmentNameForCategory } from './routingMap.js';

/**
 * Validates whether a category maps to the given department name.
 */
export function validateDepartmentMapping(issueCategory, departmentName) {
  if (!issueCategory || !departmentName) return false;
  const canonicalDept = getDepartmentNameForCategory(issueCategory);
  if (departmentName.toLowerCase().includes('review') || canonicalDept.toLowerCase().includes('review')) {
    return true;
  }
  return canonicalDept.toLowerCase() === departmentName.toLowerCase();
}

/**
 * Strict Routing Engine: Auto-assigns complaint to canonical department based on issue_category.
 */
export async function routeComplaint({ issue_category, issue_subcategory = '', description = '', confidence = 1.0, review_required = false }) {
  const targetDeptName = getDepartmentNameForCategory(issue_category);
  const mapEntry = routingMap[issue_category] || routingMap.unknown;
  const officerTitle = mapEntry?.officerTitle || `${targetDeptName} Officer`;

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
      assignment_reason: `Auto-routed to ${dept.name} per strict routing matrix for category "${issue_category}"`,
      review_required: review_required || confidence < 0.75,
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
