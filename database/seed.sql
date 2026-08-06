-- =====================================================
-- CityPulse AI — Seed Data (Fixed Deterministic UUIDs)
-- Run AFTER schema.sql
-- =====================================================

-- Step 1: Seed departments with fixed deterministic UUIDs
INSERT INTO departments (id, name, description, contact_email, contact_phone, active)
VALUES
  ('00000000-0000-0000-0000-000000000001','Roads Department','Roads maintenance and potholes','roads@city.gov','0001',true),
  ('00000000-0000-0000-0000-000000000002','Sanitation Department','Waste collection and sanitation','sanitation@city.gov','0002',true),
  ('00000000-0000-0000-0000-000000000003','Water Supply Department','Water supply and leakage','water@city.gov','0003',true),
  ('00000000-0000-0000-0000-000000000004','Drainage & Sewage Department','Drainage and sewage issues','drainage@city.gov','0004',true),
  ('00000000-0000-0000-0000-000000000005','Electrical Department','Street lighting and electrical faults','electrical@city.gov','0005',true),
  ('00000000-0000-0000-0000-000000000006','Public Works Department','Public infrastructure and debris','publicworks@city.gov','0006',true),
  ('00000000-0000-0000-0000-000000000007','Traffic Department','Traffic signals and operations','traffic@city.gov','0007',true),
  ('00000000-0000-0000-0000-000000000008','Municipal Complaint Review Unit','Triage for ambiguous reports','review@city.gov','0008',true)
ON CONFLICT (name) DO UPDATE SET
  id = EXCLUDED.id,
  description = EXCLUDED.description,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  active = EXCLUDED.active;

-- Step 2: Seed debug officer user
INSERT INTO users (id, full_name, email, password_hash, role)
VALUES ('00000000-0000-0000-0000-00000000ff01','Debug Officer','debug.officer@city.gov','$2a$12$e6mZg3l0bT0r.Z0y7K2R1e.9f2g7h5j3k1m9n7p5q3r1s9t7u5v3w', 'officer')
ON CONFLICT (email) DO UPDATE SET role = 'officer';

-- Step 2b: Link officer to Roads Department
INSERT INTO department_officers (id, user_id, department_id, officer_title, active)
VALUES ('00000000-0000-0000-0000-00000000ff11','00000000-0000-0000-0000-00000000ff01','00000000-0000-0000-0000-000000000001','Roads Maintenance Officer', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Seed strict routing rules using fixed department UUIDs
INSERT INTO routing_rules (issue_category, issue_subcategory, department_id, priority_weight, keywords) VALUES
  ('roads_and_potholes', 'pothole', '00000000-0000-0000-0000-000000000001', 10, ARRAY['pothole', 'road', 'asphalt', 'pavement', 'crack', 'crater']),
  ('garbage_and_sanitation', 'garbage', '00000000-0000-0000-0000-000000000002', 10, ARRAY['garbage', 'sanitation', 'trash', 'waste', 'dumpster', 'rubbish']),
  ('illegal_dumping', 'dumping', '00000000-0000-0000-0000-000000000002', 10, ARRAY['dumping', 'illegal', 'littering', 'trash site']),
  ('water_leakage', 'leak', '00000000-0000-0000-0000-000000000003', 10, ARRAY['water', 'leak', 'pipe', 'burst', 'main']),
  ('sewage_overflow', 'sewage', '00000000-0000-0000-0000-000000000004', 10, ARRAY['sewage', 'sewer', 'overflow', 'foul', 'manhole']),
  ('drainage_blockage', 'drain', '00000000-0000-0000-0000-000000000004', 10, ARRAY['drain', 'drainage', 'clog', 'blocked', 'gutter']),
  ('flooding_and_waterlogging', 'flooding', '00000000-0000-0000-0000-000000000004', 10, ARRAY['flooding', 'waterlog', 'submerged', 'inundation']),
  ('streetlight_failure', 'lighting', '00000000-0000-0000-0000-000000000005', 10, ARRAY['streetlight', 'lamp', 'dark', 'light pole', 'lighting']),
  ('electrical_hazards', 'hazard', '00000000-0000-0000-0000-000000000005', 10, ARRAY['electrical', 'wire', 'cable', 'transformer', 'shock', 'sparking']),
  ('fallen_trees_and_debris', 'tree', '00000000-0000-0000-0000-000000000006', 10, ARRAY['tree', 'fallen', 'branch', 'debris', 'storm']),
  ('public_infrastructure_damage', 'infrastructure', '00000000-0000-0000-0000-000000000006', 10, ARRAY['infrastructure', 'bridge', 'wall', 'building', 'structure']),
  ('traffic_signal_failure', 'signal', '00000000-0000-0000-0000-000000000007', 10, ARRAY['traffic', 'signal', 'light', 'junction', 'stoplight']),
  ('public_safety_hazards', 'unclear', '00000000-0000-0000-0000-000000000008', 5, ARRAY['hazard', 'danger', 'safety', 'unclear']),
  ('noise_or_nuisance', 'nuisance', '00000000-0000-0000-0000-000000000008', 10, ARRAY['noise', 'nuisance', 'loud', 'disturbance']),
  ('unknown', 'unclassified', '00000000-0000-0000-0000-000000000008', 10, ARRAY['unknown', 'other', 'unspecified'])
ON CONFLICT DO NOTHING;
