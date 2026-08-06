// server/src/controllers/departments.js
import { supabase } from '../config/supabase.js';
import { departmentCreateSchema, departmentUpdateSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { logAudit, getAuditMeta } from '../services/audit.js';

export async function listDepartments(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    if (error) return next(createError(500, error.message));
    res.json({ departments: data });
  } catch (err) { next(err); }
}

export async function createDepartment(req, res, next) {
  try {
    const validated = departmentCreateSchema.parse(req.body);
    const { data, error } = await supabase.from('departments').insert(validated).select().single();
    if (error) return next(createError(500, error.message));
    await logAudit({ user_id: req.user.id, action: 'department_created', metadata: { name: validated.name }, ...getAuditMeta(req) });
    res.status(201).json({ department: data });
  } catch (err) { next(err); }
}

export async function updateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const validated = departmentUpdateSchema.parse(req.body);
    const { data, error } = await supabase.from('departments').update(validated).eq('id', id).select().single();
    if (error || !data) return next(createError(404, 'Department not found'));
    await logAudit({ user_id: req.user.id, action: 'department_updated', metadata: { id, ...validated }, ...getAuditMeta(req) });
    res.json({ department: data });
  } catch (err) { next(err); }
}

export async function deleteDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) return next(createError(500, error.message));
    await logAudit({ user_id: req.user.id, action: 'department_deleted', metadata: { id }, ...getAuditMeta(req) });
    res.json({ message: 'Department deleted' });
  } catch (err) { next(err); }
}

export async function listDepartmentOfficers(req, res, next) {
  try {
    const { data: officers, error } = await supabase
      .from('department_officers')
      .select('id, user_id, department_id, officer_title, active, departments(name), users(full_name, email)')
      .eq('active', true);

    if (error && !error.message?.includes('schema cache')) {
      return next(createError(500, error.message));
    }

    const formatted = (officers || []).map(o => ({
      id: o.id,
      user_id: o.user_id,
      department_id: o.department_id,
      officer_title: o.officer_title,
      department_name: o.departments?.name || 'Department',
      full_name: o.users?.full_name || 'Officer',
      email: o.users?.email || '',
      label: `${o.departments?.name || 'Department'} — ${o.officer_title}`,
    }));

    res.json(formatted);
  } catch (err) { next(err); }
}
