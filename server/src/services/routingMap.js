// server/src/services/routingMap.js — Canonical Complaint Category to Department Routing Matrix
export const routingMap = {
  // Roads Department
  'Roads & Potholes': { departmentName: 'Roads Department', officerTitle: 'Roads Maintenance Officer' },
  'roads_and_potholes': { departmentName: 'Roads Department', officerTitle: 'Roads Maintenance Officer' },

  // Sanitation Department
  'Garbage & Sanitation': { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },
  'garbage_and_sanitation': { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },
  'Illegal Dumping': { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },
  'illegal_dumping': { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },

  // Water Supply Department
  'Water Leakage': { departmentName: 'Water Supply Department', officerTitle: 'Water Supply Officer' },
  'water_leakage': { departmentName: 'Water Supply Department', officerTitle: 'Water Supply Officer' },

  // Drainage & Sewage Department
  'Sewage Overflow': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  'sewage_overflow': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  'Drainage Blockage': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  'drainage_blockage': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  'Flooding & Waterlogging': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  'flooding_and_waterlogging': { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },

  // Electrical Department
  'Streetlight Failure': { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },
  'streetlight_failure': { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },
  'Electrical Hazards': { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },
  'electrical_hazards': { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },

  // Traffic Department
  'Traffic Signal Failure': { departmentName: 'Traffic Department', officerTitle: 'Traffic Operations Officer' },
  'traffic_signal_failure': { departmentName: 'Traffic Department', officerTitle: 'Traffic Operations Officer' },

  // Public Works Department
  'Infrastructure Damage': { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  'infrastructure_damage': { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  'public_infrastructure_damage': { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  'Fallen Trees & Debris': { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  'fallen_trees_and_debris': { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },

  // Municipal Complaint Review Unit
  'Public Safety Hazards': { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  'public_safety_hazards': { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  'Noise or Nuisance': { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  'noise_or_nuisance': { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  'unknown': { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
};

/**
 * Resolves canonical department name based on category input string.
 */
export function getDepartmentNameForCategory(categoryInput) {
  if (!categoryInput) return 'Municipal Complaint Review Unit';

  // Direct lookup
  if (routingMap[categoryInput]) {
    return routingMap[categoryInput].departmentName;
  }

  // Strip emojis & normalize string
  const clean = categoryInput
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .trim()
    .toLowerCase();

  if (clean.includes('road') || clean.includes('pothole')) {
    return 'Roads Department';
  }
  if (clean.includes('garbage') || clean.includes('sanitation') || clean.includes('dumping')) {
    return 'Sanitation Department';
  }
  if (clean.includes('water leakage') || clean.includes('water_leakage') || clean.includes('water leak')) {
    return 'Water Supply Department';
  }
  if (clean.includes('sewage') || clean.includes('drainage') || clean.includes('flooding') || clean.includes('waterlogging')) {
    return 'Drainage & Sewage Department';
  }
  if (clean.includes('streetlight') || clean.includes('electrical') || clean.includes('power')) {
    return 'Electrical Department';
  }
  if (clean.includes('traffic') || clean.includes('signal')) {
    return 'Traffic Department';
  }
  if (clean.includes('infrastructure') || clean.includes('tree') || clean.includes('debris') || clean.includes('fallen')) {
    return 'Public Works Department';
  }
  if (clean.includes('safety') || clean.includes('noise') || clean.includes('nuisance')) {
    return 'Municipal Complaint Review Unit';
  }

  return 'Municipal Complaint Review Unit';
}

export default routingMap;
