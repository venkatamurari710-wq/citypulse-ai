// server/src/services/routingMap.js — Exact Department & Officer Routing Mapping Matrix
export const routingMap = {
  roads_and_potholes: { departmentName: 'Roads Department', officerTitle: 'Roads Maintenance Officer' },
  garbage_and_sanitation: { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },
  water_leakage: { departmentName: 'Water Supply Department', officerTitle: 'Water Supply Officer' },
  sewage_overflow: { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  streetlight_failure: { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },
  electrical_hazards: { departmentName: 'Electrical Department', officerTitle: 'Electrical Works Officer' },
  illegal_dumping: { departmentName: 'Sanitation Department', officerTitle: 'Sanitation Officer' },
  fallen_trees_and_debris: { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  drainage_blockage: { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  public_infrastructure_damage: { departmentName: 'Public Works Department', officerTitle: 'Public Works Officer' },
  traffic_signal_failure: { departmentName: 'Traffic Department', officerTitle: 'Traffic Operations Officer' },
  flooding_and_waterlogging: { departmentName: 'Drainage & Sewage Department', officerTitle: 'Drainage & Sewage Officer' },
  public_safety_hazards: { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  noise_or_nuisance: { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' },
  unknown: { departmentName: 'Municipal Complaint Review Unit', officerTitle: 'Municipal Complaint Review Officer' }
};

export default routingMap;
