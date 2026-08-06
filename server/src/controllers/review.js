// server/src/controllers/review.js — Officer Review Queue Controller
import { supabase } from '../config/supabase.js';
import { reviewAssignSchema, reviewOverrideSchema, reviewMergeSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { logAudit, getAuditMeta } from '../services/audit.js';
import { getOfficerDepartmentInfo } from '../services/officerRegistry.js';

export async function getReviewQueue(req, res, next) {
  return getOfficerDashboard(req, res, next);
}

export async function getOfficerDashboard(req, res, next) {
  try {
    const isOfficer = req.user.role === 'officer';
    let deptInfo = null;

    if (isOfficer) {
      deptInfo = await getOfficerDepartmentInfo(req.user);
      console.log(`Officer Department: ${deptInfo?.department_name}`);
    }

    const deptId = deptInfo?.department_id || null;
    const departmentName = deptInfo?.department_name || (isOfficer ? 'General Review Queue' : 'All Departments');

    const { page = 1, limit = 15, filter = 'needs_review' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Apply strict department scoping filter in backend DB query
    const applyDeptFilter = (query) => {
      if (isOfficer && deptId) {
        return query.eq('department_id', deptId);
      }
      return query;
    };

    // 1. Fetch summary counts
    let totalQ = applyDeptFilter(supabase.from('complaints').select('id', { count: 'exact', head: true }));
    let activeQ = applyDeptFilter(supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['assigned', 'in_progress', 'analyzing', 'investigating']));
    let pendingQ = applyDeptFilter(supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['pending', 'needs_review', 'submitted']));
    let resolvedQ = applyDeptFilter(supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['resolved', 'closed']));

    // 2. Fetch complaint table data
    let complaintsQ = applyDeptFilter(
      supabase.from('complaints').select(`
        id, title, issue_category, issue_subcategory, severity, urgency, status,
        duplicate_status, confidence, review_required, address_text, latitude, longitude,
        created_at, updated_at,
        departments(id, name),
        users(id, full_name, email),
        uploads(id, file_type)
      `, { count: 'exact' })
    );

    if (filter === 'active') {
      complaintsQ = complaintsQ.in('status', ['assigned', 'in_progress', 'analyzing', 'investigating']);
    } else if (filter === 'needs_review' || filter === 'pending') {
      complaintsQ = complaintsQ.in('status', ['pending', 'needs_review', 'submitted']);
    } else if (filter === 'resolved') {
      complaintsQ = complaintsQ.in('status', ['resolved', 'closed']);
    }

    complaintsQ = complaintsQ
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const [
      totalRes,
      activeRes,
      pendingRes,
      resolvedRes,
      complaintsRes
    ] = await Promise.all([
      totalQ,
      activeQ,
      pendingQ,
      resolvedQ,
      complaintsQ
    ]);

    const totalComplaints = totalRes?.count || 0;
    const activeComplaints = activeRes?.count || 0;
    const pendingReview = pendingRes?.count || 0;
    const resolvedComplaints = resolvedRes?.count || 0;
    const complaintsRaw = complaintsRes?.data || [];
    const totalFiltered = complaintsRes?.count || complaintsRaw.length;

    const complaintsData = complaintsRaw.map(c => ({
      ...c,
      assignedDepartment: c.departments?.name || departmentName,
      departmentName: c.departments?.name || departmentName,
    }));

    console.log(`📌 [OFFICER DASHBOARD QUERY SUCCESS]:`);
    console.log(`  ├─ Officer Department: "${departmentName}"`);
    console.log(`  ├─ Supabase Query: SELECT * FROM complaints WHERE department_id = "${deptId}"`);
    console.log(`  └─ Complaints Returned: ${complaintsData.length}`);

    res.json({
      departmentName,
      totalComplaints,
      activeComplaints,
      pendingReview,
      resolvedComplaints,
      complaints: complaintsData,
      totalFiltered,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('[OFFICER DASHBOARD FATAL ERROR]:', err);
    res.json({
      departmentName: 'General Review Queue',
      totalComplaints: 0,
      activeComplaints: 0,
      pendingReview: 0,
      resolvedComplaints: 0,
      complaints: [],
      totalFiltered: 0,
      page: 1,
      limit: 15
    });
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

export async function updateOfficerAction(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = req.user.role === 'officer';

    // 1. Fetch complaint
    const { data: complaint, error: fetchErr } = await supabase
      .from('complaints')
      .select('id, title, department_id, status, issue_category, created_at, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !complaint) return next(createError(404, 'Complaint not found'));

    // 2. Department Security Check
    if (isOfficer) {
      const officerDept = await getOfficerDepartmentInfo(req.user);
      if (!officerDept?.department_id || complaint.department_id !== officerDept.department_id) {
        return next(createError(403, 'Access denied: You can only manage complaints assigned to your department.'));
      }
    }

    const {
      status,
      priority,
      severity,
      urgency,
      eta,
      internal_notes,
      public_message,
      resolution_summary,
      action_type,
    } = req.body;

    // 3. Validation for Resolution
    if (status === 'resolved' || status === 'completed' || action_type === 'mark_resolved') {
      if (!resolution_summary || resolution_summary.trim() === '') {
        return next(createError(400, 'Resolution summary is required to mark a complaint as resolved.'));
      }
    }

    const newStatus = status || (action_type === 'mark_resolved' ? 'resolved' : action_type === 'mark_in_progress' ? 'in_progress' : action_type === 'reject' ? 'rejected' : complaint.status);

    const updates = {
      status: newStatus,
      review_required: false,
      updated_at: new Date().toISOString(),
    };

    if (priority || severity) updates.severity = priority || severity;
    if (urgency) updates.urgency = urgency;
    if (resolution_summary) updates.ai_summary = resolution_summary;

    // Process file uploads if work completion evidence attached
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        let fileType = 'image';
        if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) fileType = 'video';
        else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) fileType = 'document';

        await supabase.from('uploads').insert({
          complaint_id: complaint.id,
          user_id: req.user.id,
          file_name: file.originalname,
          file_type: fileType,
          mime_type: file.mimetype,
          file_size: file.size,
          storage_path: file.path,
        });
      }
    }

    // 4. Update complaints table
    const { data: updated, error: updateErr } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select('*, departments(id, name), uploads(*), complaint_updates(*)')
      .single();

    if (updateErr) return next(createError(500, updateErr.message));

    // 5. Create timeline entry in complaint_updates
    const formattedMessage = internal_notes
      ? `Officer Note: ${internal_notes}`
      : `Status updated to "${newStatus}" by Officer ${req.user.full_name || 'Officer'}`;

    const defaultPublicMessage = newStatus === 'resolved'
      ? `Issue has been resolved. ${resolution_summary || ''}`
      : `Complaint status updated to ${newStatus.replace('_', ' ')}.`;

    await supabase.from('complaint_updates').insert({
      complaint_id: id,
      updated_by: req.user.id,
      status: newStatus,
      message: formattedMessage,
      public_message: public_message || defaultPublicMessage,
      eta: eta ? (isNaN(Date.parse(eta)) ? null : new Date(eta).toISOString()) : null,
    });

    await logAudit({
      user_id: req.user.id,
      complaint_id: id,
      action: 'officer_action_update',
      metadata: { status: newStatus, action_type, resolution_summary },
      ...getAuditMeta(req),
    });

    res.json({
      message: newStatus === 'resolved' ? 'Complaint marked as resolved successfully!' : 'Officer action recorded successfully.',
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
}
