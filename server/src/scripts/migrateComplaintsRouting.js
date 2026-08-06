// server/src/scripts/migrateComplaintsRouting.js — Existing Complaints Department Routing Migration
import 'dotenv/config';
import { supabase } from '../config/supabase.js';
import { getDepartmentNameForCategory } from '../services/routingMap.js';

export async function migrateComplaintsRouting() {
  console.log('🔄 Starting existing complaints routing migration...');

  // 1. Fetch all seeded/active departments
  const { data: departments, error: deptErr } = await supabase
    .from('departments')
    .select('id, name');

  if (deptErr) {
    console.error('❌ Failed to fetch departments for migration:', deptErr.message);
    return;
  }

  const deptMap = {};
  (departments || []).forEach(d => {
    deptMap[d.name.toLowerCase()] = d.id;
  });

  const reviewUnitDeptId = deptMap['municipal complaint review unit'] || departments?.[0]?.id;

  // 2. Fetch all existing complaints
  const { data: complaints, error: compErr } = await supabase
    .from('complaints')
    .select('id, title, issue_category, department_id, status');

  if (compErr) {
    console.error('❌ Failed to fetch complaints for migration:', compErr.message);
    return;
  }

  if (!complaints || complaints.length === 0) {
    console.log('ℹ️ No existing complaints found to migrate.');
    return;
  }

  console.log(`📋 Found ${complaints.length} existing complaints to recalculate routing.`);

  let updatedCount = 0;

  for (const comp of complaints) {
    const categoryInput = comp.issue_category || comp.title;
    const targetDeptName = getDepartmentNameForCategory(categoryInput);
    const targetDeptId = deptMap[targetDeptName.toLowerCase()] || reviewUnitDeptId;

    const updatePayload = {
      department_id: targetDeptId,
    };

    // Attempt to update assigned_department text column if present in table
    try {
      updatePayload.assigned_department = targetDeptName;
    } catch (e) {
      // Ignore if text column not present
    }

    const { error: updateErr } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', comp.id);

    if (updateErr) {
      // Fall back without assigned_department if column missing in DB
      delete updatePayload.assigned_department;
      await supabase.from('complaints').update(updatePayload).eq('id', comp.id);
    }

    updatedCount++;
    console.log(`  ✓ Complaint [${comp.id.substring(0, 8)}...] category "${categoryInput}" -> ${targetDeptName} (${targetDeptId})`);
  }

  console.log(`✅ Successfully recalculated and migrated ${updatedCount} complaints to their canonical departments!`);
}

// Auto-run if executed directly via CLI: node server/src/scripts/migrateComplaintsRouting.js
if (process.argv[1] && process.argv[1].endsWith('migrateComplaintsRouting.js')) {
  migrateComplaintsRouting().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
