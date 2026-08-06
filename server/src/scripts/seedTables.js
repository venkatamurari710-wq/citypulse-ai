import 'dotenv/config';
import { supabase } from '../config/supabase.js';

async function main() {
  console.log('Inserting Debug Officer via Supabase Client...');
  
  // 1. Insert Debug Officer User
  const userPayload = {
    id: '00000000-0000-0000-0000-00000000ff01',
    full_name: 'Debug Officer',
    email: 'debug.officer@city.gov',
    password_hash: '$2a$12$e6mZg3l0bT0r.Z0y7K2R1e.9f2g7h5j3k1m9n7p5q3r1s9t7u5v3w',
    role: 'officer',
  };

  const { data: user, error: uErr } = await supabase.from('users').upsert(userPayload, { onConflict: 'email' }).select().single();
  if (uErr) console.error('User upsert note:', uErr.message);
  else console.log('✅ User seeded:', user.id, user.email);

  // 2. Insert department_officers link
  const linkPayload = {
    id: '00000000-0000-0000-0000-00000000ff11',
    user_id: '00000000-0000-0000-0000-00000000ff01',
    department_id: '00000000-0000-0000-0000-000000000001',
    officer_title: 'Roads Maintenance Officer',
    active: true,
  };

  const { data: link, error: lErr } = await supabase.from('department_officers').upsert(linkPayload, { onConflict: 'id' }).select().single();
  if (lErr) console.error('Link upsert note:', lErr.message);
  else console.log('✅ Department officer link seeded:', link.id, link.officer_title);

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
