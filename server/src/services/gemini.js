// server/src/services/gemini.js — Google GenAI SDK Integration (SERVER ONLY)
// CRITICAL: This file must never be imported or bundled into frontend code.
// GEMINI_API_KEY is read from server environment only.

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

// Initialize the GenAI client once
const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const MODEL_NAME = 'gemini-2.0-flash';

const SYSTEM_INSTRUCTION = `You are an expert civic operations intelligence agent for complaint triage, duplication detection, department routing, and public-service prioritization.

Your role:
- Analyze multimodal citizen complaints carefully.
- Identify likely civic issue types from text, images, videos, voice transcripts, and documents.
- Use cautious reasoning and avoid overclaiming certainty.
- Detect duplicates using location, temporal clues, image evidence, and semantic similarity.
- Prioritize complaints based on severity, safety risk, exposure, traffic, repetition, and citizen impact.
- Route complaints to the correct department using jurisdiction and category logic.
- Provide transparent, citizen-friendly status explanations.
- Recommend whether officer review is needed.
- Never give misleading status updates.
- Never invent completion times or departmental actions.
- Prefer conservative, explainable recommendations.
- Ask clarifying questions when the evidence is insufficient.
- Output only valid JSON matching the required schema.`;

const TRIAGE_PROMPT = `You are a multimodal civic intelligence engine. Given complaint text, uploaded media, geolocation, and jurisdiction metadata, infer the most likely civic issue, identify duplicates, recommend a department, and provide a safe, structured triage decision.

Return ONLY strict JSON matching this exact schema (no markdown, no explanation outside JSON):

{
  "issue_category": "roads_and_potholes | garbage_and_sanitation | water_leakage | sewage_overflow | streetlight_failure | electrical_hazards | illegal_dumping | fallen_trees_and_debris | drainage_blockage | public_infrastructure_damage | traffic_signal_failure | public_safety_hazards | flooding_and_waterlogging | noise_or_nuisance | unknown",
  "issue_subcategory": "string describing the specific subcategory",
  "duplicate_status": "unknown | unique | likely_duplicate | merged",
  "duplicate_group_id": null,
  "confidence": 0.85,
  "severity": "low | medium | high | critical",
  "urgency": "low | medium | high | immediate",
  "department": "Name of the department that should handle this",
  "officer_title": "Title of the primary officer or unit responsible (e.g., Road Maintenance Supervisor, Sanitation Superintendent)",
  "assignment_reason": "Specific justification for routing to this department",
  "explanation": "Clear, citizen-friendly explanation of what was found and what happens next",
  "likely_causes": ["cause1", "cause2"],
  "recommended_actions": ["action1", "action2", "action3"],
  "precautions": ["precaution1", "precaution2"],
  "follow_up_questions": ["question if needed"],
  "review_required": false,
  "model_version": "gemini-1.5-flash",
  "safety_notes": ["safety note if any"],
  "localization_hint": "en",
  "observed_signals": {
    "from_text": ["signal from text"],
    "from_image": ["signal from image if provided"],
    "from_audio": ["signal from audio if provided"],
    "from_video": ["signal from video if provided"],
    "from_document": [],
    "from_location": ["signal from location if provided"]
  }
}

Strict Department Mapping Rules:
- roads_and_potholes -> Roads Department
- garbage_and_sanitation -> Sanitation Department
- water_leakage -> Water Supply Department
- sewage_overflow -> Drainage & Sewage Department
- streetlight_failure -> Electrical Department / Street Lighting Unit
- electrical_hazards -> Electrical Department
- illegal_dumping -> Sanitation Department
- fallen_trees_and_debris -> Public Works Department / Disaster Response Unit
- drainage_blockage -> Drainage & Sewage Department
- public_infrastructure_damage -> Public Works Department
- traffic_signal_failure -> Traffic Department
- flooding_and_waterlogging -> Drainage & Sewage Department
- public_safety_hazards -> Municipal Complaint Review Officer if unclear, otherwise Public Works Department
- noise_or_nuisance -> Municipal Complaint Review Officer
- unknown -> Municipal Complaint Review Officer

Rules:
- confidence must be 0.0 to 1.0
- review_required must be true when confidence < 0.75, or category is unknown, noise_or_nuisance, or ambiguous public_safety_hazards
- critical or immediate urgency always triggers review_required
- Include 3-6 recommended_actions
- Include 2-5 precautions
- Include 1-4 follow_up_questions only if evidence is unclear
- Language must be understandable by both citizens and officials`;

/**
 * Convert file to base64 inline part for Gemini API
 */
function fileToInlinePart(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Main triage function — sends complaint data to Gemini for analysis
 */
export async function analyzeComplaint({ text, files = [], location, existingComplaintsContext = '' }) {
  const parts = [];

  // Build context text
  let contextText = TRIAGE_PROMPT + '\n\n';
  contextText += `=== CITIZEN COMPLAINT ===\n`;
  contextText += `Title/Description: ${text}\n`;

  if (location?.latitude && location?.longitude) {
    contextText += `\nLocation: Lat ${location.latitude}, Lon ${location.longitude}`;
    if (location.address_text) contextText += ` (${location.address_text})`;
  }

  if (existingComplaintsContext) {
    contextText += `\n\n=== RECENT NEARBY COMPLAINTS (for deduplication context) ===\n${existingComplaintsContext}`;
  }

  contextText += `\n\n=== UPLOADED FILES (${files.length} files) ===\n`;
  files.forEach((f, i) => {
    contextText += `File ${i + 1}: ${f.file_name} (${f.file_type}, ${f.mime_type})\n`;
  });

  parts.push({ text: contextText });

  // Add media files (images, audio — Gemini 1.5 Flash supports these inline)
  for (const f of files) {
    try {
      if (f.file_type === 'image' || f.file_type === 'audio') {
        if (fs.existsSync(f.local_path) && f.file_size < 5 * 1024 * 1024) { // <5MB inline
          parts.push(fileToInlinePart(f.local_path, f.mime_type));
        }
      }
    } catch (err) {
      console.error(`[Gemini] Could not read file ${f.file_name}:`, err.message);
    }
  }

  try {
    const model = genAI.models;
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return { rawText, cleanJson };
  } catch (err) {
    console.error('[Gemini] API error:', err.message);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
}
