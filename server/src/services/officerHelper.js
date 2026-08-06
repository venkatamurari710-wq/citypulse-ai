// server/src/services/officerHelper.js — Officer Department Resolution Helper
import { supabase } from '../config/supabase.js';

export async function resolveOfficerDepartmentId(user) {
  if (!user) return null;
  if (user.department_id) return user.department_id;

  // 1. Query users table directly
  try {
    const { data: userRec } = await supabase
      .from('users')
      .select('department_id')
      .eq('id', user.id)
      .maybeSingle();

    if (userRec?.department_id) {
      return userRec.department_id;
    }
  } catch (e) {
    // Ignore schema errors
  }

  // 2. Query department_officers table
  try {
    const { data: deptOfficer } = await supabase
      .from('department_officers')
      .select('department_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (deptOfficer?.department_id) {
      return deptOfficer.department_id;
    }
  } catch (e) {
    // Ignore table missing errors
  }

  return null;
}
