// server/src/controllers/review.js — Officer Review Queue Controller
import { supabase } from '../config/supabase.js';
import { reviewAssignSchema, reviewOverrideSchema, reviewMergeSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { logAudit, getAuditMeta } from '../services/audit.js';

export async function getReviewQueue(req, res, next) {
  try {
    const { page = 1, limit = 20, status, filter } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isOfficer = req.user.role === 'officer';

    let query = supabase
      .from('complaints')
      .select(`
        id, title, issue_category, issue_subcategory, severity, urgency, status,
        duplicate_status, confidence, review_required, address_text, latitude, longitude,
        created_at, updated_at,
        departments(id, name),
        users(id, full_name, email),
        uploads(id, file_type)
      `, { count: 'exact' });

    // Strict Department Scoping for Officers
    if (isOfficer) {
      if (req.user.department_id) {
        query = query.eq('department_id', req.user.department_id);
      } else {
        query = query.is('department_id', null);
      }
    }

    if (filter === 'active') {
      query = query.in('status', ['assigned', 'in_progress', 'analyzing']);
    } else if (filter === 'needs_review') {
      query = query.in('status', ['pending', 'needs_review']);
    } else if (filter === 'resolved') {
      query = query.in('status', ['resolved', 'closed']);
    } else if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) return next(createError(500, error.message));

    res.json({ complaints: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

export async function getOfficerDashboard(req, res, next) {
  try {
    const isOfficer = req.user.role === 'officer';
    const deptId = isOfficer ? (req.user.department_id || '00000000-0000-0000-0000-000000000000') : null;

    let totalQuery = supabase.from('complaints').select('id', { count: 'exact', head: true });
    let activeQuery = supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['assigned', 'in_progress', 'analyzing']);
    let pendingQuery = supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['pending', 'needs_review']);
    let resolvedQuery = supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['resolved', 'closed']);

    let recentQuery = supabase
      .from('complaints')
      .select(`
        id, title, issue_category, severity, urgency, status, address_text, created_at,
        users(id, full_name, email),
        departments(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (deptId) {
      totalQuery = totalQuery.eq('department_id', deptId);
      activeQuery = activeQuery.eq('department_id', deptId);
      pendingQuery = pendingQuery.eq('department_id', deptId);
      resolvedQuery = resolvedQuery.eq('department_id', deptId);
      recentQuery = recentQuery.eq('department_id', deptId);
    }

    const [
      { count: totalComplaints },
      { count: activeComplaints },
      { count: pendingReview },
      { count: resolvedComplaints },
      { data: recentComplaints }
    ] = await Promise.all([
      totalQuery,
      activeQuery,
      pendingQuery,
      resolvedQuery,
      recentQuery
    ]);

    let departmentName = null;
    if (deptId && deptId !== '00000000-0000-0000-0000-000000000000') {
      const { data: dept } = await supabase.from('departments').select('name').eq('id', deptId).single();
      if (dept) departmentName = dept.name;
    }

    res.json({
      departmentName: departmentName || (isOfficer ? 'Unassigned Department' : 'All Departments'),
      totalComplaints: totalComplaints || 0,
      activeComplaints: activeComplaints || 0,
      pendingReview: pendingReview || 0,
      resolvedComplaints: resolvedComplaints || 0,
      recentComplaints: recentComplaints || []
    });
  } catch (err) {
    next(err);
  }
}

export async function assignComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const validated = reviewAssignSchema.parse(req.body);

    const { data: complaint } = await supabase.from('complaints').select('id').eq('id', id).single();
    if (!complaint) return next(createError(404, 'Complaint not found'));

    await supabase.from('complaints').update({
      department_id: validated.department_id,
      status: validated.status,
      review_required: false,
    }).eq('id', id);

    await supabase.from('complaint_assignments').insert({
      complaint_id: id,
      department_id: validated.department_id,
      assigned_by: req.user.id,
      assignment_reason: validated.assignment_reason || 'Manual assignment by officer',
    });

    await supabase.from('complaint_updates').insert({
      complaint_id: id,
      updated_by: req.user.id,
      status: validated.status,
      message: `Assigned to department by officer ${req.user.full_name}.`,
      public_message: validated.public_message || 'Your complaint has been assigned to the relevant department.',
      eta: validated.eta || null,
    });

    await logAudit({ user_id: req.user.id, complaint_id: id, action: 'complaint_assigned', metadata: validated, ...getAuditMeta(req) });
    res.json({ message: 'Complaint assigned successfully' });
  } catch (err) { next(err); }
}

export async function overrideComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const validated = reviewOverrideSchema.parse(req.body);

    const updates = {};
    if (validated.issue_category) updates.issue_category = validated.issue_category;
    if (validated.severity) updates.severity = validated.severity;
    if (validated.urgency) updates.urgency = validated.urgency;
    if (validated.department_id) updates.department_id = validated.department_id;
    if (validated.status) updates.status = validated.status;
    updates.review_required = false;

    await supabase.from('complaints').update(updates).eq('id', id);

    await supabase.from('complaint_updates').insert({
      complaint_id: id,
      updated_by: req.user.id,
      status: validated.status || 'assigned',
      message: `AI recommendation overridden by officer. Reason: ${validated.override_reason}`,
      public_message: validated.public_message || 'An officer has reviewed and updated your complaint details.',
    });

    await logAudit({
      user_id: req.user.id, complaint_id: id, action: 'ai_override',
      metadata: { override_reason: validated.override_reason, changes: updates },
      ...getAuditMeta(req),
    });

    res.json({ message: 'Complaint overridden successfully' });
  } catch (err) { next(err); }
}

export async function mergeComplaint(req, res, next) {
  try {
    const { id } = req.params; // related complaint to merge
    const validated = reviewMergeSchema.parse(req.body);

    // Check both exist
    const { data: root } = await supabase.from('complaints').select('id').eq('id', validated.root_complaint_id).single();
    if (!root) return next(createError(404, 'Root complaint not found'));

    await supabase.from('complaint_relations').upsert({
      root_complaint_id: validated.root_complaint_id,
      related_complaint_id: id,
      relation_type: validated.relation_type,
    }, { onConflict: 'root_complaint_id,related_complaint_id,relation_type' });

    await supabase.from('complaints').update({
      duplicate_status: 'merged',
      duplicate_group_id: validated.root_complaint_id,
      status: 'closed',
      review_required: false,
    }).eq('id', id);

    await supabase.from('complaint_updates').insert({
      complaint_id: id,
      updated_by: req.user.id,
      status: 'closed',
      message: `Merged into complaint ${validated.root_complaint_id} by officer.`,
      public_message: validated.message || 'Your report has been linked to an existing complaint being tracked by our team.',
    });

    await logAudit({ user_id: req.user.id, complaint_id: id, action: 'complaint_merged', metadata: { root_id: validated.root_complaint_id }, ...getAuditMeta(req) });
    res.json({ message: 'Complaints merged successfully' });
  } catch (err) { next(err); }
}
