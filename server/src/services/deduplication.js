// server/src/services/deduplication.js — Spatial + Semantic Duplicate Detection
import { supabase } from '../config/supabase.js';

const SPATIAL_RADIUS_KM = 0.5; // 500 meters
const RECENT_WINDOW_HOURS = 72; // 3 days
const MIN_DUPLICATE_SCORE = 0.6;

/**
 * Check if a complaint is likely a duplicate of an existing one.
 * Uses spatial proximity + category matching + time window.
 * Returns { isDuplicate, duplicateGroupId, relatedComplaintIds, score }
 */
export async function detectDuplicates({ latitude, longitude, issue_category, description }) {
  if (!latitude || !longitude) {
    return { isDuplicate: false, duplicateGroupId: null, relatedComplaintIds: [] };
  }

  const windowStart = new Date(Date.now() - RECENT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  // Find complaints within spatial radius and time window with same category
  // Using Haversine approximation via SQL
  const latDelta = SPATIAL_RADIUS_KM / 111.0;
  const lonDelta = SPATIAL_RADIUS_KM / (111.0 * Math.cos((latitude * Math.PI) / 180));

  const { data: nearby } = await supabase
    .from('complaints')
    .select('id, title, description, issue_category, duplicate_group_id, latitude, longitude, created_at')
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lonDelta)
    .lte('longitude', longitude + lonDelta)
    .gte('created_at', windowStart)
    .not('status', 'in', '("closed","resolved")')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!nearby || nearby.length === 0) {
    return { isDuplicate: false, duplicateGroupId: null, relatedComplaintIds: [] };
  }

  // Score matches
  const matches = [];
  for (const c of nearby) {
    let score = 0;
    if (c.issue_category === issue_category) score += 0.5;
    // Keyword overlap scoring
    const descWords = description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const existWords = (c.description || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const overlap = descWords.filter(w => existWords.includes(w)).length;
    if (descWords.length > 0) score += Math.min(0.4, (overlap / descWords.length) * 0.4);
    // Recency boost
    const ageHours = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) score += 0.1;
    if (score > 0) matches.push({ ...c, score });
  }

  matches.sort((a, b) => b.score - a.score);
  const topMatch = matches[0];

  if (topMatch && topMatch.score >= MIN_DUPLICATE_SCORE) {
    const groupId = topMatch.duplicate_group_id || topMatch.id;
    return {
      isDuplicate: true,
      duplicateGroupId: groupId,
      relatedComplaintIds: matches.slice(0, 5).map(m => m.id),
      score: topMatch.score,
    };
  }

  return { isDuplicate: false, duplicateGroupId: null, relatedComplaintIds: [] };
}
