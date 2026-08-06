// server/src/validators/index.js — All Zod Validation Schemas
import { z } from 'zod';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().regex(/^[+\d\s\-()]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['citizen', 'officer', 'department_admin']).default('citizen').optional(),
  govt_id: z.string().max(50).optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
  preferred_language: z.string().length(2).default('en').optional(),
}).refine(data => {
  if (['officer', 'department_admin'].includes(data.role) && (!data.govt_id || data.govt_id.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Government ID / Badge # is required for Officers and Admins',
  path: ['govt_id'],
}).refine(data => {
  if (data.role === 'officer' && (!data.department_id || data.department_id.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Assigned Department is required for Officer registration',
  path: ['department_id'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['citizen', 'officer', 'department_admin', 'super_admin']).optional(),
  govt_id: z.string().optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
});

// ─── Complaint ───────────────────────────────────────────────────────────────

export const issueCategories = [
  'roads_and_potholes', 'garbage_and_sanitation', 'water_leakage', 'sewage_overflow',
  'streetlight_failure', 'electrical_hazards', 'illegal_dumping', 'fallen_trees_and_debris',
  'drainage_blockage', 'public_infrastructure_damage', 'traffic_signal_failure',
  'public_safety_hazards', 'flooding_and_waterlogging', 'noise_or_nuisance', 'unknown',
];

export const complaintCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category_hint: z.enum(issueCategories).optional(),
  address_text: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  urgency_flagged_by_citizen: z.boolean().default(false),
  consent_for_followup: z.boolean().default(true),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const complaintUpdateSchema = z.object({
  status: z.enum(['pending', 'analyzing', 'needs_review', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  department_id: z.string().uuid().optional(),
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
});

// ─── Department ──────────────────────────────────────────────────────────────

export const departmentCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  jurisdiction_area: z.string().max(200).optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional(),
  active: z.boolean().default(true),
});

export const departmentUpdateSchema = departmentCreateSchema.partial();

// ─── Routing Rules ───────────────────────────────────────────────────────────

export const routingRuleCreateSchema = z.object({
  issue_category: z.enum(issueCategories),
  issue_subcategory: z.string().max(100).optional(),
  department_id: z.string().uuid(),
  priority_weight: z.number().int().min(0).max(100).default(0),
  keywords: z.array(z.string().max(50)).default([]),
  active: z.boolean().default(true),
});

export const routingRuleUpdateSchema = routingRuleCreateSchema.partial();

// ─── Upload ──────────────────────────────────────────────────────────────────

export const uploadMetadataSchema = z.object({
  complaint_id: z.string().uuid().optional(),
  file_name: z.string().max(255),
  file_type: z.enum(['image', 'video', 'audio', 'document']),
  mime_type: z.string().max(100),
  file_size: z.number().int().positive(),
  storage_path: z.string().max(500),
});

export const STRICT_ROUTING_MAP = {
  roads_and_potholes: 'Roads Department',
  garbage_and_sanitation: 'Sanitation Department',
  water_leakage: 'Water Supply Department',
  sewage_overflow: 'Drainage & Sewage Department',
  streetlight_failure: 'Electrical Department / Street Lighting Unit',
  electrical_hazards: 'Electrical Department',
  illegal_dumping: 'Sanitation Department',
  fallen_trees_and_debris: 'Public Works Department / Disaster Response Unit',
  drainage_blockage: 'Drainage & Sewage Department',
  public_infrastructure_damage: 'Public Works Department',
  traffic_signal_failure: 'Traffic Department',
  flooding_and_waterlogging: 'Drainage & Sewage Department',
  public_safety_hazards: 'Public Works Department',
  noise_or_nuisance: 'Municipal Complaint Review Officer',
  unknown: 'Municipal Complaint Review Officer',
};

// ─── AI Response ─────────────────────────────────────────────────────────────

export const aiResponseSchema = z.object({
  issue_category: z.enum(issueCategories),
  issue_subcategory: z.string().default(''),
  duplicate_status: z.enum(['unknown', 'unique', 'likely_duplicate', 'merged']).default('unique'),
  duplicate_group_id: z.string().uuid().nullable().optional(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']),
  department: z.string(),
  officer_title: z.string().default('Municipal Officer'),
  assignment_reason: z.string().default('Auto-routed by AI classification'),
  explanation: z.string(),
  likely_causes: z.array(z.string()).optional().default([]),
  recommended_actions: z.array(z.string()).min(1).max(10),
  precautions: z.array(z.string()).max(10),
  follow_up_questions: z.array(z.string()).max(5).optional().default([]),
  review_required: z.boolean(),
  model_version: z.string().default('gemini-1.5-flash'),
  safety_notes: z.array(z.string()).optional().default([]),
  localization_hint: z.string().optional().default('en'),
  observed_signals: z.object({
    from_text: z.array(z.string()).optional().default([]),
    from_image: z.array(z.string()).optional().default([]),
    from_audio: z.array(z.string()).optional().default([]),
    from_video: z.array(z.string()).optional().default([]),
    from_document: z.array(z.string()).optional().default([]),
    from_location: z.array(z.string()).optional().default([]),
  }).optional(),
});

// ─── Review Actions ───────────────────────────────────────────────────────────

export const reviewAssignSchema = z.object({
  department_id: z.string().uuid(),
  assignment_reason: z.string().max(500).optional(),
  status: z.enum(['assigned', 'in_progress', 'needs_review']).default('assigned'),
  public_message: z.string().max(1000).optional(),
  eta: z.string().datetime().optional(),
});

export const reviewOverrideSchema = z.object({
  issue_category: z.enum(issueCategories).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']).optional(),
  department_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'analyzing', 'needs_review', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  override_reason: z.string().min(5).max(1000),
  public_message: z.string().max(1000).optional(),
});

export const reviewMergeSchema = z.object({
  root_complaint_id: z.string().uuid(),
  relation_type: z.enum(['duplicate', 'same_location', 'same_issue', 'follow_up']).default('duplicate'),
  message: z.string().max(500).optional(),
});

// ─── Admin Filters ───────────────────────────────────────────────────────────

export const adminFilterSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
  status: z.enum(['pending', 'analyzing', 'needs_review', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  category: z.enum(issueCategories).optional(),
  department_id: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
  role: z.enum(['citizen', 'officer', 'department_admin', 'super_admin']).optional(),
});
