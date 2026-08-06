// server/src/services/audit.js — Audit Log Service
import { supabase } from '../config/supabase.js';

export async function logAudit({ user_id, complaint_id, action, metadata = {}, ip_address, user_agent }) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: user_id || null,
      complaint_id: complaint_id || null,
      action,
      metadata,
      ip_address: ip_address || null,
      user_agent: user_agent || null,
    });
  } catch (err) {
    // Non-fatal — log but don't throw
    console.error('[Audit] Failed to write audit log:', err.message);
  }
}

export function getAuditMeta(req) {
  return {
    ip_address: req.ip || req.connection?.remoteAddress,
    user_agent: req.get('user-agent'),
  };
}
