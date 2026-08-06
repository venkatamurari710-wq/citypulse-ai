// server/src/config/supabase.js — Supabase client (service role, server-side only)
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Service role client — bypasses RLS for trusted server-side operations
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper: run a query and throw formatted error
export async function dbQuery(queryFn) {
  const { data, error } = await queryFn(supabase);
  if (error) throw new Error(error.message);
  return data;
}
