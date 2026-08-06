// server/src/controllers/auth.js — Authentication Controller
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { generateToken } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { logAudit, getAuditMeta } from '../services/audit.js';
import { createError } from '../middleware/errorHandler.js';

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const targetRole = ['officer', 'department_admin'].includes(data.role) ? data.role : 'citizen';
    const isPrivileged = ['officer', 'department_admin'].includes(targetRole);

    // Check existing user by email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingEmail) return next(createError(409, 'Email already registered'));

    // Check existing Govt ID if officer or admin
    if (isPrivileged && data.govt_id) {
      const { data: existingGovtId } = await supabase
        .from('users')
        .select('id')
        .eq('govt_id', data.govt_id)
        .single();
      if (existingGovtId) return next(createError(409, 'Government ID / Badge # already registered'));
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 12);

    let deptId = targetRole === 'officer' && data.department_id ? data.department_id : null;
    let deptName = null;

    if (deptId) {
      const { data: dept } = await supabase.from('departments').select('id, name').eq('id', deptId).single();
      if (dept) {
        deptName = dept.name;
      } else {
        const { data: deptByName } = await supabase.from('departments').select('id, name').ilike('name', `%${deptId}%`).limit(1).maybeSingle();
        if (deptByName) {
          deptId = deptByName.id;
          deptName = deptByName.name;
        }
      }
    }

    const insertPayload = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      password_hash,
      role: targetRole,
      govt_id: isPrivileged ? (data.govt_id || null) : null,
      department_id: deptId,
      preferred_language: data.preferred_language || 'en',
    };

    let user = null;
    let error = null;

    const dbRes = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, full_name, email, role, phone, department_id, preferred_language, created_at, departments(id, name)')
      .single();

    user = dbRes.data;
    error = dbRes.error;

    if (error && error.message?.includes('schema cache')) {
      delete insertPayload.govt_id;
      delete insertPayload.department_id;

      const fallbackRes = await supabase
        .from('users')
        .insert(insertPayload)
        .select('id, full_name, email, role, phone, preferred_language, created_at')
        .single();

      user = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) return next(createError(500, error.message));

    if (targetRole === 'officer' && deptId && user?.id) {
      try {
        await supabase.from('department_officers').insert({
          user_id: user.id,
          department_id: deptId,
          officer_title: `${deptName || 'Department'} Officer`,
          active: true,
        });
      } catch (e) {
        console.warn('Failed to insert into department_officers table:', e.message);
      }
    }

    const token = generateToken(user);
    await logAudit({ user_id: user.id, action: 'user_registered', metadata: { email: user.email, role: user.role, govt_id: user.govt_id }, ...getAuditMeta(req) });

    const safeUser = {
      ...user,
      assignedDepartment: deptName || user?.departments?.name || (user?.role === 'officer' ? 'Not Assigned' : null),
    };

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const { data: user, error } = await supabase
      .from('users')
      .select('*, departments(id, name), department_officers(department_id, departments(name))')
      .eq('email', data.email)
      .single();

    if (error || !user) return next(createError(401, 'Invalid email or password'));
    if (!user.is_active) return next(createError(403, 'Account is disabled'));

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) return next(createError(401, 'Invalid email or password'));

    if (data.role) {
      if (data.role === 'officer' && user.role !== 'officer') {
        return next(createError(403, `This account (${user.email}) is registered as a Citizen. Please click the "Citizen" tab to sign in, or register an Officer account.`));
      }
      if (data.role === 'department_admin' && !['department_admin', 'super_admin'].includes(user.role)) {
        return next(createError(403, `This account (${user.email}) is registered as a ${user.role === 'officer' ? 'Government Officer' : 'Citizen'}. Please click the "${user.role === 'officer' ? 'Officer' : 'Citizen'}" tab to sign in.`));
      }
    }

    if (data.govt_id && data.govt_id.trim() !== '') {
      if (user.govt_id && user.govt_id.trim().toLowerCase() !== data.govt_id.trim().toLowerCase()) {
        return next(createError(401, 'Government ID / Badge # does not match account record'));
      }
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    const assignedDeptName =
      user.departments?.name ||
      user.department_officers?.[0]?.departments?.name ||
      (user.role === 'officer' ? 'Not Assigned' : null);

    safeUser.assignedDepartment = assignedDeptName;

    await logAudit({ user_id: user.id, action: 'user_login', metadata: { role: user.role }, ...getAuditMeta(req) });

    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, department_id, preferred_language, avatar_url, is_active, created_at, updated_at, departments(id, name), department_officers(department_id, departments(name))')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return next(createError(404, 'User not found'));

    const assignedDeptName =
      user.departments?.name ||
      user.department_officers?.[0]?.departments?.name ||
      (user.role === 'officer' ? 'Not Assigned' : null);

    const safeUser = {
      ...user,
      assignedDepartment: assignedDeptName,
    };
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

export async function updateProfile(req, res, next) {
  try {
    const allowed = ['full_name', 'phone', 'preferred_language'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return next(createError(400, 'No valid fields to update'));

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, full_name, email, phone, role, department_id, preferred_language, avatar_url, created_at, updated_at, departments(id, name), department_officers(department_id, departments(name))')
      .single();

    if (error) return next(createError(500, error.message));

    const assignedDeptName =
      user.departments?.name ||
      user.department_officers?.[0]?.departments?.name ||
      (user.role === 'officer' ? 'Not Assigned' : null);

    const safeUser = {
      ...user,
      assignedDepartment: assignedDeptName,
    };
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}
