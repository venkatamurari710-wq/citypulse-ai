// client/src/services/categoryDetector.js — AI & Fuzzy Keyword Complaint Category Detection Engine
import api from './api';

// Canonical Category Metadata Mapping
export const CATEGORY_DEFINITIONS = [
  {
    value: 'drainage_blockage',
    label: 'Drainage Blockage',
    icon: '🚰',
    keywords: [
      'drain', 'drainage', 'gutter', 'culvert', 'clogged', 'clog', 'clogging', 'blocked drain',
      'drainage blockage', 'water overflowing from drain', 'overflowing drain', 'water overflowing',
      'drain pipe', 'storm drain', 'choked drain', 'drain choke'
    ],
  },
  {
    value: 'roads_and_potholes',
    label: 'Potholes & Road Damage',
    icon: '🛣',
    keywords: [
      'pothole', 'potholes', 'huge pothole', 'road damage', 'damaged road', 'asphalt',
      'crater', 'road defect', 'broken road', 'tar road', 'road hole', 'cave in', 'bus stop pothole',
      'road crack', 'uneven road', 'pit'
    ],
  },
  {
    value: 'garbage_and_sanitation',
    label: 'Garbage Collection',
    icon: '🗑',
    keywords: [
      'garbage', 'trash', 'waste', 'rubbish', 'garbage collection', 'garbage not collected',
      'uncollected trash', 'dumpster', 'dustbin', 'bin overflow', 'refuse', 'litter',
      'waste pickup', 'trash pile', 'smelly trash', 'stinking garbage'
    ],
  },
  {
    value: 'water_leakage',
    label: 'Water Supply',
    icon: '💧',
    keywords: [
      'water leakage', 'water leak', 'leaking water', 'water pipe', 'pipe burst', 'pipe leak',
      'water supply', 'no water', 'drinking water', 'water main', 'tap leak', 'water pressure',
      'water pipeline', 'gushing water'
    ],
  },
  {
    value: 'sewage_overflow',
    label: 'Sewage',
    icon: '🌊',
    keywords: [
      'sewage', 'open manhole', 'manhole', 'sewer', 'sewer line', 'septic', 'foul smell',
      'wastewater', 'sewage overflow', 'sewer leak', 'black water', 'manhole cover missing',
      'overflowing sewer'
    ],
  },
  {
    value: 'streetlight_failure',
    label: 'Street Lights',
    icon: '💡',
    keywords: [
      'street light', 'streetlight', 'street light not working', 'lamp post', 'light pole',
      'dark street', 'broken light', 'no street light', 'lighting failure', 'street lantern',
      'light bulb out', 'flickering street light'
    ],
  },
  {
    value: 'electrical_hazards',
    label: 'Electricity',
    icon: '⚡',
    keywords: [
      'electricity', 'electric wire', 'hanging wire', 'short circuit', 'transformer',
      'electric pole', 'power outage', 'high voltage', 'sparking', 'exposed wire',
      'live wire', 'power line', 'electric meter'
    ],
  },
  {
    value: 'traffic_signal_failure',
    label: 'Traffic Signal',
    icon: '🚦',
    keywords: [
      'traffic light', 'traffic signal', 'signal not working', 'broken signal', 'red light broken',
      'traffic signal failure', 'signal junction', 'traffic jam', 'blinkers not working'
    ],
  },
  {
    value: 'public_safety_hazards',
    label: 'Public Safety',
    icon: '⚠',
    keywords: [
      'public safety', 'danger', 'hazardous', 'open pit', 'unprotected construction',
      'collapsed wall', 'unsafe structure', 'hazard', 'falling tiles', 'risk to life'
    ],
  },
  {
    value: 'illegal_dumping',
    label: 'Illegal Dumping',
    icon: '🚯',
    keywords: [
      'illegal dump', 'illegal dumping', 'dumping debris', 'unauthorized dumping',
      'construction debris', 'dumped waste', 'dumping site'
    ],
  },
  {
    value: 'fallen_trees_and_debris',
    label: 'Tree Maintenance',
    icon: '🌲',
    keywords: [
      'fallen tree', 'tree branch', 'broken branch', 'tree blocking', 'tree maintenance',
      'overgrown tree', 'tree branch fallen', 'uprooted tree', 'pruning needed'
    ],
  },
  {
    value: 'noise_or_nuisance',
    label: 'Noise Pollution',
    icon: '📢',
    keywords: [
      'noise', 'noise pollution', 'loud speaker', 'loud music', 'nuisance', 'late night noise',
      'heavy honking', 'construction noise', 'high volume'
    ],
  },
  {
    value: 'flooding_and_waterlogging',
    label: 'Flooding & Waterlogging',
    icon: '🌧',
    keywords: [
      'flooding', 'waterlogging', 'water stagnated', 'submerged road', 'heavy rain flood',
      'flooded street', 'water accumulation'
    ],
  },
];

/**
 * Fuzzy helper: calculate similarity score between query tokens and keywords
 */
function calculateFuzzyScore(text, keywords) {
  const normalizedText = text.toLowerCase().trim();
  if (!normalizedText) return 0;

  let totalScore = 0;
  let maxPhraseBonus = 0;

  for (const kw of keywords) {
    const normKw = kw.toLowerCase();
    
    // 1. Exact phrase match in text
    if (normalizedText.includes(normKw)) {
      const phraseScore = normKw.length > 8 ? 0.95 : 0.85;
      if (phraseScore > maxPhraseBonus) maxPhraseBonus = phraseScore;
      totalScore += 0.4;
    }

    // 2. Individual word token matches
    const kwTokens = normKw.split(/\s+/);
    for (const token of kwTokens) {
      if (token.length > 2 && normalizedText.includes(token)) {
        totalScore += 0.25;
      }
    }
  }

  return Math.min(0.98, maxPhraseBonus + totalScore * 0.1);
}

/**
 * Local Rule-based & Fuzzy Keyword Category Detector
 * Returns: { category, confidence, label }
 */
export function detectCategoryLocally(title = '', description = '') {
  const fullText = `${title} ${description}`.trim();
  if (!fullText || fullText.length < 3) {
    return { category: null, confidence: 0, label: null };
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const def of CATEGORY_DEFINITIONS) {
    // Title has 2x weight over description
    const titleScore = calculateFuzzyScore(title, def.keywords);
    const descScore = calculateFuzzyScore(description, def.keywords);
    const combinedScore = Math.max(titleScore * 1.0, titleScore * 0.7 + descScore * 0.3);

    if (combinedScore > highestScore) {
      highestScore = combinedScore;
      bestMatch = def;
    }
  }

  // Normalize confidence score between 0 and 1
  const confidence = Math.round(highestScore * 100) / 100;

  if (!bestMatch || confidence < 0.3) {
    return { category: null, confidence: 0, label: null };
  }

  return {
    category: bestMatch.value,
    confidence: Math.min(0.98, confidence),
    label: bestMatch.label,
  };
}

/**
 * Extensible Detection Service (Local Fuzzy + Optional Backend LLM fallback)
 * Allows seamless replacement or enhancement with LLM without changing UI code.
 */
export async function detectCategory(title = '', description = '', useRemoteAI = false) {
  // First run local ultra-fast detection
  const localResult = detectCategoryLocally(title, description);

  // If local confidence is already very high (>= 75%) or remote AI is disabled, return immediately
  if (localResult.confidence >= 0.75 || !useRemoteAI) {
    return localResult;
  }

  // Optional: Extensible remote AI call fallback
  try {
    const res = await api.post('/complaints/predict-category', { title, description });
    if (res.data?.category) {
      return {
        category: res.data.category,
        confidence: res.data.confidence || 0.85,
        label: res.data.label || localResult.label,
      };
    }
  } catch (err) {
    // Graceful fallback to local result if network/remote fails
  }

  return localResult;
}
