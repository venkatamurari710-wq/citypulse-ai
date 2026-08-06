// server/src/scripts/seedAccounts.js — Seed Test Run Accounts (Citizens, Officers for all 8 Departments, Admins)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

export async function seedAccounts() {
  console.log('🌱 Starting account seeding...');

  const defaultPassword = 'Password@123';
  const password_hash = await bcrypt.hash(defaultPassword, 12);

  // Fetch departments to map IDs
  const { data: departments, error: dErr } = await supabase.from('departments').select('id, name');
  if (dErr) {
    console.error('Error fetching departments:', dErr.message);
  }

  const deptMap = {};
  (departments || []).forEach(d => {
    deptMap[d.name.toLowerCase()] = d.id;
  });

  console.log('Available departments in DB:', Object.keys(deptMap));

  const roadsDeptId = deptMap['roads department'] || departments?.[0]?.id;
  const sanitationDeptId = deptMap['sanitation department'] || departments?.[1]?.id;
  const waterDeptId = deptMap['water supply department'] || departments?.[2]?.id;
  const drainageDeptId = deptMap['drainage & sewage department'] || departments?.[3]?.id;
  const electricalDeptId = deptMap['electrical department'] || departments?.[4]?.id;
  const publicWorksDeptId = deptMap['public works department'] || departments?.[5]?.id;
  const trafficDeptId = deptMap['traffic department'] || departments?.[6]?.id;
  const reviewDeptId = deptMap['municipal complaint review unit'] || departments?.[7]?.id;

  const testAccounts = [
    // 1. Super Admin Account
    {
      full_name: 'CityPulse System Administrator',
      email: 'admin@citypulse.gov',
      phone: '+1 555-0100',
      password_hash,
      role: 'super_admin',
      govt_id: 'GOVT-ADMIN-001',
      preferred_language: 'en',
    },
    // 2. Department Admin Account
    {
      full_name: 'Municipal Department Chief',
      email: 'dept.admin@citypulse.gov',
      phone: '+1 555-0101',
      password_hash,
      role: 'department_admin',
      govt_id: 'GOVT-DADMIN-002',
      preferred_language: 'en',
    },
    // 3. Roads Department Officer
    {
      full_name: 'Officer Alex Rivera (Roads)',
      email: 'roads.officer@citypulse.gov',
      phone: '+1 555-0102',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-ROAD-101',
      department_id: roadsDeptId,
      preferred_language: 'en',
    },
    // 4. Sanitation Department Officer
    {
      full_name: 'Officer Sarah Chen (Sanitation)',
      email: 'sanitation.officer@citypulse.gov',
      phone: '+1 555-0103',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-SAN-102',
      department_id: sanitationDeptId,
      preferred_language: 'en',
    },
    // 5. Water Supply Officer
    {
      full_name: 'Officer Michael Scott (Water Supply)',
      email: 'water.officer@citypulse.gov',
      phone: '+1 555-0104',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-WAT-103',
      department_id: waterDeptId,
      preferred_language: 'en',
    },
    // 6. Drainage & Sewage Officer
    {
      full_name: 'Officer David Miller (Drainage & Sewage)',
      email: 'drainage.officer@citypulse.gov',
      phone: '+1 555-0105',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-DRAIN-104',
      department_id: drainageDeptId,
      preferred_language: 'en',
    },
    // 7. Electrical Officer
    {
      full_name: 'Officer James Wilson (Electrical)',
      email: 'electrical.officer@citypulse.gov',
      phone: '+1 555-0106',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-ELEC-105',
      department_id: electricalDeptId,
      preferred_language: 'en',
    },
    // 8. Public Works Officer
    {
      full_name: 'Officer Robert Taylor (Public Works)',
      email: 'publicworks.officer@citypulse.gov',
      phone: '+1 555-0107',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-PW-106',
      department_id: publicWorksDeptId,
      preferred_language: 'en',
    },
    // 9. Traffic Officer
    {
      full_name: 'Officer Amanda Martinez (Traffic)',
      email: 'traffic.officer@citypulse.gov',
      phone: '+1 555-0108',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-TRAF-107',
      department_id: trafficDeptId,
      preferred_language: 'en',
    },
    // 10. Municipal Complaint Review Officer
    {
      full_name: 'Officer Lisa Anderson (Review Unit)',
      email: 'review.officer@citypulse.gov',
      phone: '+1 555-0109',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-REV-108',
      department_id: reviewDeptId,
      preferred_language: 'en',
    },
    // 11. Citizen 1
    {
      full_name: 'John Citizen',
      email: 'john.citizen@gmail.com',
      phone: '+1 555-0201',
      password_hash,
      role: 'citizen',
      preferred_language: 'en',
    },
    // 12. Citizen 2
    {
      full_name: 'Emily Watson',
      email: 'emily.watson@gmail.com',
      phone: '+1 555-0202',
      password_hash,
      role: 'citizen',
      preferred_language: 'en',
    },
  ];

  for (const acc of testAccounts) {
    const { data: existing } = await supabase.from('users').select('id, email').eq('email', acc.email).maybeSingle();
    
    const userPayload = {
      full_name: acc.full_name,
      email: acc.email,
      phone: acc.phone,
      password_hash: acc.password_hash,
      role: acc.role,
      department_id: acc.department_id || null,
      preferred_language: acc.preferred_language,
    };

    let userId = existing?.id;

    if (existing) {
      const { error: updateErr } = await supabase.from('users').update(userPayload).eq('id', existing.id);
      if (updateErr) {
        // Fall back without department_id if column fails
        delete userPayload.department_id;
        await supabase.from('users').update(userPayload).eq('id', existing.id);
      }
      console.log(`✅ Updated existing account: ${acc.email} (${acc.role})`);
    } else {
      const { data: newUser, error: insertErr } = await supabase.from('users').insert(userPayload).select().single();
      if (insertErr) {
        delete userPayload.department_id;
        const { data: fallbackUser } = await supabase.from('users').insert(userPayload).select().single();
        userId = fallbackUser?.id;
      } else {
        userId = newUser.id;
      }
      console.log(`✅ Created new account: ${acc.email} (${acc.role})`);
    }

    // Insert into department_officers table if officer
    if (acc.role === 'officer' && acc.department_id && userId) {
      try {
        await supabase.from('department_officers').upsert({
          user_id: userId,
          department_id: acc.department_id,
          officer_title: `${acc.full_name} Title`,
          active: true,
        }, { onConflict: 'user_id' });
      } catch (e) {
        // ignore link errors
      }
    }
  }

  console.log('🎉 All department officer test accounts seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seedAccounts.js')) {
  seedAccounts().then(() => process.exit(0)).catch(err => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });
}
