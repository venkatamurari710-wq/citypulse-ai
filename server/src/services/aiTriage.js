// server/src/services/aiTriage.js — Multimodal AI Triage Pipeline
import { analyzeComplaint } from './gemini.js';
import { aiResponseSchema } from '../validators/index.js';
import { routeComplaint } from './routing.js';
import { detectDuplicates } from './deduplication.js';
import { supabase } from '../config/supabase.js';

/**
 * Full triage pipeline:
 * 1. Fetch nearby complaints for deduplication context
 * 2. Send to Gemini for multimodal analysis
 * 3. Validate AI response schema
 * 4. Run deduplication
 * 5. Determine routing
 * 6. Return enriched result
 */
export async function runTriage({ complaintId, title, description, location, uploadedFiles, userId }) {
  // 1. Fetch recent nearby complaints for deduplication context
  let existingContext = '';
  if (location?.latitude && location?.longitude) {
    const latDelta = 1 / 111.0;
    const lonDelta = 1 / (111.0 * Math.cos((location.latitude * Math.PI) / 180));
    const windowStart = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const { data: nearby } = await supabase
      .from('complaints')
      .select('id, title, issue_category, status, created_at')
      .gte('latitude', location.latitude - latDelta)
      .lte('latitude', location.latitude + latDelta)
      .gte('longitude', location.longitude - lonDelta)
      .lte('longitude', location.longitude + lonDelta)
      .gte('created_at', windowStart)
      .neq('id', complaintId)
      .limit(5);

    if (nearby && nearby.length > 0) {
      existingContext = nearby
        .map(c => `- [${c.id}] "${c.title}" (${c.issue_category}, ${c.status}) filed at ${c.created_at}`)
        .join('\n');
    }
  }

  // 2. Call Gemini
  const { rawText, cleanJson } = await analyzeComplaint({
    text: `Title: ${title}\n\nDescription: ${description}`,
    files: uploadedFiles,
    location,
    existingComplaintsContext: existingContext,
  });

  // 3. Parse and validate AI response
  let aiResult;
  try {
    const parsed = JSON.parse(cleanJson);
    aiResult = aiResponseSchema.parse(parsed);
  } catch (err) {
    console.error('[Triage] AI response validation failed:', err.message, '\nRaw:', rawText);
    // Return safe fallback requiring officer review
    return {
      aiResult: {
        issue_category: 'unknown',
        issue_subcategory: 'validation_failed',
        duplicate_status: 'unknown',
        duplicate_group_id: null,
        confidence: 0,
        severity: 'medium',
        urgency: 'medium',
        department: 'Officer Review Required',
        explanation: 'The AI could not confidently classify this complaint. An officer will review it manually.',
        likely_causes: [],
        recommended_actions: ['Wait for officer review', 'Contact local authorities if urgent'],
        precautions: ['Do not approach dangerous situations'],
        follow_up_questions: [],
        review_required: true,
        model_version: 'gemini-1.5-flash',
        safety_notes: [],
        localization_hint: 'en',
        observed_signals: {},
      },
      routing: { department_id: null, department_name: null, reason: 'AI validation failed' },
      duplicates: { isDuplicate: false, duplicateGroupId: null, relatedComplaintIds: [] },
      rawText,
    };
  }

  // 4. Run spatial deduplication
  const duplicates = await detectDuplicates({
    latitude: location?.latitude,
    longitude: location?.longitude,
    issue_category: aiResult.issue_category,
    description,
  });

  // Override AI duplicate status with spatial result if stronger
  if (duplicates.isDuplicate && aiResult.duplicate_status === 'unknown') {
    aiResult.duplicate_status = 'likely_duplicate';
    aiResult.duplicate_group_id = duplicates.duplicateGroupId;
    aiResult.review_required = true;
  }

  // 5. Route strictly to primary department per fixed matrix
  const routing = await routeComplaint({
    issue_category: aiResult.issue_category,
    issue_subcategory: aiResult.issue_subcategory,
    description,
    confidence: aiResult.confidence,
    review_required: aiResult.review_required,
  });

  if (routing.review_required) {
    aiResult.review_required = true;
  }

  aiResult.department = routing.department_name;
  aiResult.officer_title = routing.officer_title || 'Municipal Officer';
  aiResult.assignment_reason = routing.assignment_reason || 'Strict category routing';

  return { aiResult, routing, duplicates, rawText };
}
