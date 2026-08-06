// server/src/controllers/auth.js — Authentication Controller
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { generateToken } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { logAudit, getAuditMeta } from '../services/audit.js';
import { createError } from '../middleware/errorHandler.js';

import { getOfficerDepartmentInfo, registerOfficerDepartment } from '../services/officerRegistry.js';

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const targetRole = ['officer', 'department_admin'].includes(data.role) ? data.role : 'citizen';
    const isPrivileged = ['officer', 'department_admin'].includes(targetRole);
    const cleanEmail = data.email.trim().toLowerCase();

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) return next(createError(409, 'Email already registered'));

    const password_hash = await bcrypt.hash(data.password, 12);

    let deptId = targetRole === 'officer' && data.department_id ? data.department_id : null;
    let deptName = null;

    if (deptId) {
      const { data: dept } = await supabase.from('departments').select('id, name').eq('id', deptId).maybeSingle();
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
      email: cleanEmail,
      phone: data.phone || null,
      password_hash,
      role: targetRole,
      preferred_language: data.preferred_language || 'en',
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, full_name, email, role, phone, preferred_language, created_at')
      .single();

    if (error) {
      console.error('[AUTH REGISTER ERROR]:', error.message);
      return next(createError(500, error.message));
    }

    let officerDeptInfo = null;
    if (targetRole === 'officer') {
      officerDeptInfo = await getOfficerDepartmentInfo({ ...user, department_id: deptId, department_name: deptName });
      registerOfficerDepartment(user.id, user.email, officerDeptInfo.department_id, officerDeptInfo.department_name);
      console.log(`Officer Department: ${officerDeptInfo.department_name}`);
    }

    const tokenPayload = { ...user, department_id: officerDeptInfo?.department_id || null };
    const token = generateToken(tokenPayload);

    await logAudit({ user_id: user.id, action: 'user_registered', metadata: { email: user.email, role: user.role }, ...getAuditMeta(req) });

    const safeUser = {
      ...user,
      department_id: officerDeptInfo?.department_id || null,
      assignedDepartment: officerDeptInfo?.department_name || null,
    };

    console.log(`[AUTH REGISTER SUCCESS] User registered: ${user.email} (${user.role})`);
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const cleanEmail = data.email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error(`[AUTH LOGIN ERROR] Database error finding user "${cleanEmail}":`, error.message);
      return next(createError(500, 'Database error during login'));
    }

    if (!user) {
      console.warn(`[AUTH LOGIN FAIL] User not found: "${cleanEmail}"`);
      return next(createError(401, 'Invalid email or password'));
    }

    if (!user.is_active) {
      console.warn(`[AUTH LOGIN FAIL] Account disabled: "${cleanEmail}"`);
      return next(createError(403, 'Account is disabled'));
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      console.warn(`[AUTH LOGIN FAIL] Password mismatch for: "${cleanEmail}"`);
      return next(createError(401, 'Invalid email or password'));
    }

    if (data.role) {
      if (data.role === 'officer' && user.role !== 'officer') {
        return next(createError(403, `This account (${user.email}) is registered as a Citizen. Please switch to the Citizen tab to sign in.`));
      }
      if (data.role === 'citizen' && user.role === 'officer') {
        return next(createError(403, `This account (${user.email}) is registered as an Officer. Please switch to the Officer tab to sign in.`));
      }
    }

    let officerDeptInfo = null;
    if (user.role === 'officer') {
      officerDeptInfo = await getOfficerDepartmentInfo(user);
      console.log(`Officer Department: ${officerDeptInfo.department_name}`);
    }

    const tokenPayload = { ...user, department_id: officerDeptInfo?.department_id || user.department_id || null };
    const token = generateToken(tokenPayload);

    const { password_hash, ...safeUser } = user;
    safeUser.department_id = officerDeptInfo?.department_id || user.department_id || null;
    safeUser.assignedDepartment = officerDeptInfo?.department_name || null;

    console.log(`[AUTH LOGIN SUCCESS] User logged in: ${user.email} (${user.role})`);
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
      .select('id, full_name, email, phone, role, department_id, preferred_language, avatar_url, is_active, created_at, updated_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      console.warn(`[AUTH GET_ME FAIL] User session invalid for ID "${req.user?.id}":`, error?.message || 'User not found in DB');
      return next(createError(401, 'Invalid or expired authentication session'));
    }

    let officerDeptInfo = null;
    if (user.role === 'officer') {
      officerDeptInfo = await getOfficerDepartmentInfo(user);
    }

    const safeUser = {
      ...user,
      fullName: user.full_name,
      department_id: officerDeptInfo?.department_id || user.department_id || null,
      assignedDepartment: officerDeptInfo?.department_name || null,
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
      .select('id, full_name, email, phone, role, department_id, preferred_language, avatar_url, created_at, updated_at')
      .single();

    if (error) return next(createError(500, error.message));

    let assignedDeptName = null;
    if (user.department_id) {
      const { data: dept } = await supabase
        .from('departments')
        .select('name')
        .eq('id', user.department_id)
        .maybeSingle();
      if (dept) assignedDeptName = dept.name;
    }

    const safeUser = {
      ...user,
      assignedDepartment: assignedDeptName || (user.role === 'officer' ? 'Not Assigned' : null),
    };
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}
