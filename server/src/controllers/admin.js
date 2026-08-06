// server/src/controllers/admin.js — Admin Controller
import { supabase } from '../config/supabase.js';
import { adminFilterSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';

export async function listUsers(req, res, next) {
  try {
    const { page = '1', limit = '20', role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('users')
      .select('id, full_name, email, phone, role, is_active, preferred_language, created_at', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return next(createError(500, error.message));
    res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

export async function toggleUserActive(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (id === req.user.id) return next(createError(400, 'Cannot modify your own account'));

    const { data, error } = await supabase
      .from('users').update({ is_active }).eq('id', id).select('id, is_active').single();

    if (error || !data) return next(createError(404, 'User not found'));
    res.json({ user: data });
  } catch (err) { next(err); }
}

export async function listAllComplaints(req, res, next) {
  try {
    const { page = '1', limit = '20', status, category, department_id, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('complaints')
      .select(`
        id, title, issue_category, severity, urgency, status, duplicate_status,
        confidence, review_required, address_text, created_at, updated_at,
        departments(id, name),
        users(id, full_name, email)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('issue_category', category);
    if (department_id) query = query.eq('department_id', department_id);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return next(createError(500, error.message));
    res.json({ complaints: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

export async function getAdminStats(req, res, next) {
  try {
    const [usersCount, complaintsCount, resolvedCount, reviewCount, deptCount] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('complaints').select('id', { count: 'exact', head: true }),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('review_required', true).not('status', 'in', '("resolved","closed")'),
      supabase.from('departments').select('id', { count: 'exact', head: true }).eq('active', true),
    ]);

    res.json({
      total_users: usersCount.count || 0,
      total_complaints: complaintsCount.count || 0,
      resolved_complaints: resolvedCount.count || 0,
      pending_review: reviewCount.count || 0,
      active_departments: deptCount.count || 0,
    });
  } catch (err) { next(err); }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*, users(id, full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return next(createError(500, error.message));
    res.json({ logs: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}
