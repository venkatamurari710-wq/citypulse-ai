// server/src/controllers/complaints.js — Complaint Controller
import { supabase } from '../config/supabase.js';
import { complaintCreateSchema, complaintUpdateSchema } from '../validators/index.js';
import { runTriage } from '../services/aiTriage.js';
import { routeComplaint } from '../services/routing.js';
import { logAudit, getAuditMeta } from '../services/audit.js';
import { createError } from '../middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFileType } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function listComplaints(req, res, next) {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isCitizen = req.user.role === 'citizen';
    const isOfficer = req.user.role === 'officer';
    const isAdmin = ['department_admin', 'super_admin'].includes(req.user.role);

    if (isCitizen) {
      query = query.eq('user_id', req.user.id);
    } else if (isOfficer) {
      // Department officers can ONLY see complaints assigned to their own department
      if (req.user.department_id) {
        query = query.eq('department_id', req.user.department_id);
      } else {
        // Review Officers without a specific department view items requiring review
        query = query.or('review_required.eq.true,status.eq.needs_review');
      }
    }
    // Admins and Super Admins view all complaints across all departments

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('issue_category', category);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return next(createError(500, error.message));

    res.json({ complaints: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

export async function createComplaint(req, res, next) {
  try {
    // Parse body fields (may be multipart)
    const bodyData = {
      ...req.body,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
      urgency_flagged_by_citizen: req.body.urgency_flagged_by_citizen === 'true',
      consent_for_followup: req.body.consent_for_followup !== 'false',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    };
    const validated = complaintCreateSchema.parse(bodyData);

    // Create complaint record first (status: analyzing)
    const { data: complaint, error: insertError } = await supabase
      .from('complaints')
      .insert({
        user_id: req.user.id,
        title: validated.title,
        description: validated.description,
        address_text: validated.address_text,
        latitude: validated.latitude,
        longitude: validated.longitude,
        urgency_flagged_by_citizen: validated.urgency_flagged_by_citizen,
        consent_for_followup: validated.consent_for_followup,
        tags: validated.tags,
        status: 'analyzing',
      })
      .select()
      .single();

    if (insertError) return next(createError(500, insertError.message));

    // Process uploaded files
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = getFileType(file.mimetype);
        const { data: upload, error: uploadError } = await supabase
          .from('uploads')
          .insert({
            complaint_id: complaint.id,
            user_id: req.user.id,
            file_name: file.originalname,
            file_type: fileType,
            mime_type: file.mimetype,
            file_size: file.size,
            storage_path: file.path,
          })
          .select()
          .single();

        if (!uploadError) {
          uploadedFiles.push({
            ...upload,
            local_path: file.path,
          });
        }
      }
    }

    // Run AI triage in background (but await for now for synchronous response)
    let triageResult = null;
    try {
      triageResult = await runTriage({
        complaintId: complaint.id,
        title: validated.title,
        description: validated.description,
        location: { latitude: validated.latitude, longitude: validated.longitude, address_text: validated.address_text },
        uploadedFiles,
        userId: req.user.id,
      });
    } catch (triageErr) {
      console.error('[Complaints] Triage failed:', triageErr.message);
    }

    // If AI triage didn't return a result, execute strict routing using category_hint
    let fallbackRouting = null;
    if (!triageResult) {
      fallbackRouting = await routeComplaint({
        issue_category: validated.category_hint || 'unknown',
        description: validated.description,
        confidence: 0.5,
        review_required: true,
      });
    }

    // Update complaint with AI or fallback routing results
    const aiUpdate = triageResult
      ? {
          issue_category: triageResult.aiResult.issue_category,
          issue_subcategory: triageResult.aiResult.issue_subcategory,
          duplicate_status: triageResult.aiResult.duplicate_status,
          duplicate_group_id: triageResult.aiResult.duplicate_group_id,
          confidence: triageResult.aiResult.confidence,
          severity: triageResult.aiResult.severity,
          urgency: triageResult.aiResult.urgency,
          department_id: triageResult.routing.department_id,
          ai_summary: triageResult.aiResult.explanation,
          ai_explanation: triageResult.aiResult.explanation,
          ai_recommended_actions: triageResult.aiResult.recommended_actions,
          ai_precautions: triageResult.aiResult.precautions,
          ai_follow_up_questions: triageResult.aiResult.follow_up_questions,
          ai_observed_signals: triageResult.aiResult.observed_signals,
          ai_raw_response: { raw: triageResult.rawText, parsed: triageResult.aiResult },
          model_version: triageResult.aiResult.model_version,
          safety_notes: triageResult.aiResult.safety_notes,
          localization_hint: triageResult.aiResult.localization_hint,
          review_required: triageResult.aiResult.review_required,
          status: triageResult.aiResult.review_required ? 'needs_review' :
                  triageResult.routing.department_id ? 'assigned' : 'needs_review',
        }
      : {
          issue_category: validated.category_hint || 'unknown',
          department_id: fallbackRouting?.department_id || null,
          status: 'needs_review',
          review_required: true,
        };

    const { data: updatedComplaint } = await supabase
      .from('complaints')
      .update(aiUpdate)
      .eq('id', complaint.id)
      .select()
      .single();

    // Add to duplicate group if detected
    if (triageResult?.duplicates?.relatedComplaintIds?.length > 0) {
      const relations = triageResult.duplicates.relatedComplaintIds.map(relId => ({
        root_complaint_id: triageResult.duplicates.duplicateGroupId || relId,
        related_complaint_id: complaint.id,
        relation_type: 'duplicate',
      }));
      await supabase.from('complaint_relations').insert(relations).on('conflict', 'do-nothing');
    }

    // Create status update entry
    await supabase.from('complaint_updates').insert({
      complaint_id: complaint.id,
      updated_by: req.user.id,
      status: aiUpdate.status,
      message: triageResult ? `AI triage completed with ${Math.round((triageResult.aiResult.confidence || 0) * 100)}% confidence.` : 'Complaint submitted and queued for review.',
      public_message: triageResult?.aiResult.explanation || 'Your complaint has been received and is being processed.',
    });

    // Create assignment record if routed
    if (triageResult?.routing?.department_id) {
      await supabase.from('complaint_assignments').insert({
        complaint_id: complaint.id,
        department_id: triageResult.routing.department_id,
        assignment_reason: triageResult.routing.reason,
      });

      // Write automatic entry to complaint_officer_assignments
      await supabase.from('complaint_officer_assignments').insert({
        complaint_id: complaint.id,
        department_id: triageResult.routing.department_id,
        officer_title: triageResult.aiResult?.officer_title || `${triageResult.routing.department_name} Officer`,
        assignment_type: 'automatic',
        assigned_by: req.user.id,
        assignment_reason: triageResult.routing.reason || 'Automatic routing via fixed category matrix',
      }).catch(err => console.log('[Complaints] Officer assignment table note:', err.message));
    }

    await logAudit({
      user_id: req.user.id, complaint_id: complaint.id,
      action: 'complaint_created',
      metadata: { category: aiUpdate.issue_category, status: aiUpdate.status },
      ...getAuditMeta(req),
    });

    res.status(201).json({ complaint: updatedComplaint || complaint, uploads: uploadedFiles });
  } catch (err) {
    next(err);
  }
}

export async function getComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = ['officer', 'department_admin', 'super_admin'].includes(req.user.role);

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select(`
        *,
        departments(id, name, contact_email, contact_phone),
        users(id, full_name, email, phone),
        complaint_updates(id, status, message, public_message, eta, created_at, updated_by),
        uploads(id, file_name, file_type, mime_type, file_size, storage_path, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !complaint) return next(createError(404, 'Complaint not found'));
    if (!isOfficer && complaint.user_id !== req.user.id) return next(createError(403, 'Access denied'));

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = ['officer', 'department_admin', 'super_admin'].includes(req.user.role);

    const { data: existing } = await supabase.from('complaints').select('user_id, status').eq('id', id).single();
    if (!existing) return next(createError(404, 'Complaint not found'));
    if (!isOfficer && existing.user_id !== req.user.id) return next(createError(403, 'Access denied'));

    const validated = complaintUpdateSchema.parse(req.body);
    const { data: updated, error } = await supabase
      .from('complaints').update(validated).eq('id', id).select().single();

    if (error) return next(createError(500, error.message));

    await logAudit({ user_id: req.user.id, complaint_id: id, action: 'complaint_updated', metadata: validated, ...getAuditMeta(req) });
    res.json({ complaint: updated });
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = ['officer', 'department_admin', 'super_admin'].includes(req.user.role);

    const { data: complaint } = await supabase
      .from('complaints')
      .select('*, uploads(*)')
      .eq('id', id)
      .single();

    if (!complaint) return next(createError(404, 'Complaint not found'));
    if (!isOfficer && complaint.user_id !== req.user.id) return next(createError(403, 'Access denied'));

    await supabase.from('complaints').update({ status: 'analyzing' }).eq('id', id);

    const uploadedFiles = (complaint.uploads || []).map(u => ({
      ...u,
      local_path: u.storage_path,
    }));

    const triageResult = await runTriage({
      complaintId: id,
      title: complaint.title,
      description: complaint.description,
      location: { latitude: complaint.latitude, longitude: complaint.longitude, address_text: complaint.address_text },
      uploadedFiles,
      userId: req.user.id,
    });

    const aiUpdate = {
      issue_category: triageResult.aiResult.issue_category,
      issue_subcategory: triageResult.aiResult.issue_subcategory,
      duplicate_status: triageResult.aiResult.duplicate_status,
      confidence: triageResult.aiResult.confidence,
      severity: triageResult.aiResult.severity,
      urgency: triageResult.aiResult.urgency,
      department_id: triageResult.routing.department_id,
      ai_summary: triageResult.aiResult.explanation,
      ai_explanation: triageResult.aiResult.explanation,
      ai_raw_response: { raw: triageResult.rawText, parsed: triageResult.aiResult },
      review_required: triageResult.aiResult.review_required,
      status: triageResult.aiResult.review_required ? 'needs_review' :
              triageResult.routing.department_id ? 'assigned' : 'needs_review',
    };

    const { data: updated } = await supabase.from('complaints').update(aiUpdate).eq('id', id).select().single();

    await logAudit({ user_id: req.user.id, complaint_id: id, action: 'complaint_reanalyzed', metadata: { category: aiUpdate.issue_category }, ...getAuditMeta(req) });

    res.json({ complaint: updated, triage: triageResult.aiResult });
  } catch (err) {
    next(err);
  }
}

export async function closeComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = ['officer', 'department_admin', 'super_admin'].includes(req.user.role);

    const { data: existing } = await supabase.from('complaints').select('user_id').eq('id', id).single();
    if (!existing) return next(createError(404, 'Complaint not found'));
    if (!isOfficer && existing.user_id !== req.user.id) return next(createError(403, 'Access denied'));

    await supabase.from('complaints').update({ status: 'closed' }).eq('id', id);
    await supabase.from('complaint_updates').insert({
      complaint_id: id,
      updated_by: req.user.id,
      status: 'closed',
      message: 'Complaint closed by user request.',
      public_message: 'This complaint has been closed.',
    });

    await logAudit({ user_id: req.user.id, complaint_id: id, action: 'complaint_closed', metadata: {}, ...getAuditMeta(req) });
    res.json({ message: 'Complaint closed successfully' });
  } catch (err) {
    next(err);
  }
}
