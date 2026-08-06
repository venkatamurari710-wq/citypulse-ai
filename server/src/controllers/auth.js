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
    const cleanEmail = data.email.trim().toLowerCase();

    // Check existing user by email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) return next(createError(409, 'Email already registered'));

    // Check existing Govt ID if officer or admin
    if (isPrivileged && data.govt_id) {
      const { data: existingGovtId } = await supabase
        .from('users')
        .select('id')
        .eq('govt_id', data.govt_id.trim())
        .maybeSingle();
      if (existingGovtId) return next(createError(409, 'Government ID / Badge # already registered'));
    }

    // Hash password
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
      govt_id: isPrivileged ? (data.govt_id.trim() || null) : null,
      department_id: deptId,
      preferred_language: data.preferred_language || 'en',
    };

    let user = null;
    let error = null;

    const dbRes = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, full_name, email, role, phone, department_id, preferred_language, created_at')
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

    if (error) {
      console.error('[AUTH REGISTER ERROR]:', error.message);
      return next(createError(500, error.message));
    }

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
      assignedDepartment: deptName || (user?.role === 'officer' ? 'Not Assigned' : null),
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

    // 1. Fetch user by email safely without PostgREST relation joins
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

    // 2. Compare password hash
    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      console.warn(`[AUTH LOGIN FAIL] Password mismatch for: "${cleanEmail}"`);
      return next(createError(401, 'Invalid email or password'));
    }

    // 3. Optional Role validation with helpful tab guidance
    if (data.role) {
      if (data.role === 'officer' && user.role !== 'officer') {
        return next(createError(403, `This account (${user.email}) is registered as a Citizen. Please switch to the Citizen tab to sign in.`));
      }
      if (data.role === 'citizen' && user.role === 'officer') {
        return next(createError(403, `This account (${user.email}) is registered as an Officer. Please switch to the Officer tab to sign in.`));
      }
      if (data.role === 'department_admin' && !['department_admin', 'super_admin'].includes(user.role)) {
        return next(createError(403, `This account (${user.email}) is registered as a ${user.role}. Please use the matching sign-in tab.`));
      }
    }

    // 4. Resolve assignedDepartment safely
    let assignedDeptName = null;
    if (user.department_id) {
      const { data: dept } = await supabase
        .from('departments')
        .select('name')
        .eq('id', user.department_id)
        .maybeSingle();
      if (dept) assignedDeptName = dept.name;
    }

    if (!assignedDeptName && user.role === 'officer') {
      const { data: deptOfficer } = await supabase
        .from('department_officers')
        .select('department_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (deptOfficer?.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('name')
          .eq('id', deptOfficer.department_id)
          .maybeSingle();
        if (dept) assignedDeptName = dept.name;
      }
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;
    safeUser.assignedDepartment = assignedDeptName || (user.role === 'officer' ? 'Not Assigned' : null);

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

    let assignedDeptName = null;
    if (user.department_id) {
      const { data: dept } = await supabase
        .from('departments')
        .select('name')
        .eq('id', user.department_id)
        .maybeSingle();
      if (dept) assignedDeptName = dept.name;
    }

    if (!assignedDeptName && user.role === 'officer') {
      const { data: deptOfficer } = await supabase
        .from('department_officers')
        .select('department_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (deptOfficer?.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('name')
          .eq('id', deptOfficer.department_id)
          .maybeSingle();
        if (dept) assignedDeptName = dept.name;
      }
    }

    const safeUser = {
      ...user,
      fullName: user.full_name,
      assignedDepartment: assignedDeptName || (user.role === 'officer' ? 'Not Assigned' : null),
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
