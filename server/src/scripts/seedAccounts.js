// server/src/scripts/seedAccounts.js — Seed Test Run Accounts (Citizens, Officers, Admins)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

async function seedAccounts() {
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

  // Find department IDs with fallback
  const roadsDeptId = deptMap['roads department'] || departments?.[0]?.id || null;
  const sanitationDeptId = deptMap['sanitation department'] || departments?.[1]?.id || null;
  const waterDeptId = deptMap['water supply department'] || departments?.[2]?.id || null;
  const electricalDeptId = deptMap['electrical department'] || departments?.[3]?.id || null;

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
    // 6. Electrical Officer
    {
      full_name: 'Officer David Miller (Electrical)',
      email: 'electrical.officer@citypulse.gov',
      phone: '+1 555-0105',
      password_hash,
      role: 'officer',
      govt_id: 'BADGE-ELEC-104',
      department_id: electricalDeptId,
      preferred_language: 'en',
    },
    // 7. Citizen 1
    {
      full_name: 'John Citizen',
      email: 'john.citizen@gmail.com',
      phone: '+1 555-0201',
      password_hash,
      role: 'citizen',
      preferred_language: 'en',
    },
    // 8. Citizen 2
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
      preferred_language: acc.preferred_language,
    };

    let userId = existing?.id;

    if (existing) {
      const { error: updateErr } = await supabase.from('users').update(userPayload).eq('id', existing.id);
      if (updateErr) {
        console.error(`❌ Error updating ${acc.email}:`, updateErr.message);
      } else {
        console.log(`✅ Updated existing account: ${acc.email} (${acc.role})`);
      }
    } else {
      const { data: newUser, error: insertErr } = await supabase.from('users').insert(userPayload).select().single();
      if (insertErr) {
        console.error(`❌ Error inserting ${acc.email}:`, insertErr.message);
      } else {
        userId = newUser.id;
        console.log(`✅ Created new account: ${acc.email} (${acc.role})`);
      }
    }

    // Insert into department_officers table if officer
    if (acc.role === 'officer' && acc.department_id && userId) {
      const { error: linkErr } = await supabase.from('department_officers').upsert({
        user_id: userId,
        department_id: acc.department_id,
        officer_title: `${acc.full_name} Title`,
        active: true,
      }, { onConflict: 'user_id' });

      if (linkErr) {
        console.warn(`  └─ department_officers link note: ${linkErr.message}`);
      } else {
        console.log(`  └─ Linked to department ID: ${acc.department_id}`);
      }
    }
  }

  console.log('\n🎉 All test run accounts seeded successfully!');
  process.exit(0);
}

seedAccounts().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
