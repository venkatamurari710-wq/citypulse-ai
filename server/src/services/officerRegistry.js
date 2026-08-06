// server/src/services/officerRegistry.js — Officer Department Resolver & Registry
import { supabase } from '../config/supabase.js';

export const CANONICAL_DEPARTMENTS = {
  ROADS: { id: '00000000-0000-0000-0000-000000000001', name: 'Roads Department' },
  SANITATION: { id: '00000000-0000-0000-0000-000000000002', name: 'Sanitation Department' },
  WATER: { id: '00000000-0000-0000-0000-000000000003', name: 'Water Supply Department' },
  DRAINAGE: { id: '00000000-0000-0000-0000-000000000004', name: 'Drainage & Sewage Department' },
  ELECTRICAL: { id: '00000000-0000-0000-0000-000000000005', name: 'Electrical Department' },
  PUBLIC_WORKS: { id: '00000000-0000-0000-0000-000000000006', name: 'Public Works Department' },
  TRAFFIC: { id: '00000000-0000-0000-0000-000000000007', name: 'Traffic Department' },
  REVIEW_UNIT: { id: '00000000-0000-0000-0000-000000000008', name: 'Municipal Complaint Review Unit' },
};

const knownEmailDeptMap = {
  'roads.officer@citypulse.gov': CANONICAL_DEPARTMENTS.ROADS,
  'sanitation.officer@citypulse.gov': CANONICAL_DEPARTMENTS.SANITATION,
  'water.officer@citypulse.gov': CANONICAL_DEPARTMENTS.WATER,
  'drainage.officer@citypulse.gov': CANONICAL_DEPARTMENTS.DRAINAGE,
  'electrical.officer@citypulse.gov': CANONICAL_DEPARTMENTS.ELECTRICAL,
  'publicworks.officer@citypulse.gov': CANONICAL_DEPARTMENTS.PUBLIC_WORKS,
  'traffic.officer@citypulse.gov': CANONICAL_DEPARTMENTS.TRAFFIC,
  'review.officer@citypulse.gov': CANONICAL_DEPARTMENTS.REVIEW_UNIT,
};

const dynamicOfficerMap = new Map();

export function registerOfficerDepartment(userId, email, deptId, deptName) {
  const payload = { department_id: deptId, department_name: deptName };
  if (userId) dynamicOfficerMap.set(userId, payload);
  if (email) dynamicOfficerMap.set(email.toLowerCase(), payload);
}

export async function getOfficerDepartmentInfo(user) {
  if (!user || user.role !== 'officer') return null;

  // 1. Check dynamic officer map
  if (user.id && dynamicOfficerMap.has(user.id)) {
    const info = dynamicOfficerMap.get(user.id);
    console.log(`[OFFICER DEPT RESOLVE] Found dynamic mapping for ${user.email || user.id}: "${info.department_name}"`);
    return info;
  }
  if (user.email && dynamicOfficerMap.has(user.email.toLowerCase())) {
    const info = dynamicOfficerMap.get(user.email.toLowerCase());
    console.log(`[OFFICER DEPT RESOLVE] Found dynamic mapping for ${user.email}: "${info.department_name}"`);
    return info;
  }

  // 2. Check known email mapping
  if (user.email && knownEmailDeptMap[user.email.toLowerCase()]) {
    const info = knownEmailDeptMap[user.email.toLowerCase()];
    console.log(`[OFFICER DEPT RESOLVE] Found known email mapping for ${user.email}: "${info.name}"`);
    registerOfficerDepartment(user.id, user.email, info.id, info.name);
    return { department_id: info.id, department_name: info.name };
  }

  // 3. Infer from user.department_id / department_name / assignedDepartment if passed
  let deptName = user.department_name || user.assignedDepartment || null;
  let deptId = user.department_id || null;

  // 4. Infer from full_name or email text if user was registered with department hint
  if (!deptName) {
    const str = `${user.full_name || ''} ${user.email || ''}`.toLowerCase();
    if (str.includes('road')) {
      deptName = 'Roads Department';
    } else if (str.includes('sanitation') || str.includes('garbage')) {
      deptName = 'Sanitation Department';
    } else if (str.includes('water')) {
      deptName = 'Water Supply Department';
    } else if (str.includes('drainage') || str.includes('sewage')) {
      deptName = 'Drainage & Sewage Department';
    } else if (str.includes('electrical') || str.includes('light')) {
      deptName = 'Electrical Department';
    } else if (str.includes('public works') || str.includes('publicworks')) {
      deptName = 'Public Works Department';
    } else if (str.includes('traffic')) {
      deptName = 'Traffic Department';
    } else if (str.includes('review')) {
      deptName = 'Municipal Complaint Review Unit';
    }
  }

  // Fallback to Roads Department if no text hint matched
  if (!deptName) {
    deptName = 'Roads Department';
  }

  // 5. Query departments table from DB
  const { data: dept } = await supabase
    .from('departments')
    .select('id, name')
    .ilike('name', `%${deptName}%`)
    .limit(1)
    .maybeSingle();

  const finalDeptId = dept?.id || deptId || CANONICAL_DEPARTMENTS.ROADS.id;
  const finalDeptName = dept?.name || deptName || CANONICAL_DEPARTMENTS.ROADS.name;

  const result = { department_id: finalDeptId, department_name: finalDeptName };
  registerOfficerDepartment(user.id, user.email, finalDeptId, finalDeptName);

  console.log(`[OFFICER DEPT RESOLVE] Resolved for ${user.email || user.id}:`);
  console.log(`  └─ Officer Department: "${finalDeptName}" (ID: ${finalDeptId})`);

  return result;
}
