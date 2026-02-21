-- ============================================
-- COMPLETE ERP DATABASE SCHEMA WITH BATCH MANAGEMENT
-- PostgreSQL - Fresh Install
-- ============================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS outdoor_sampling CASCADE;
DROP TABLE IF EXISTS holding_area CASCADE;
DROP TABLE IF EXISTS fertilization CASCADE;
DROP TABLE IF EXISTS outdoor_mortality CASCADE;
DROP TABLE IF EXISTS shifting CASCADE;
DROP TABLE IF EXISTS secondary_hardening CASCADE;
DROP TABLE IF EXISTS tray_details CASCADE;
DROP TABLE IF EXISTS primary_hardening CASCADE;
DROP TABLE IF EXISTS sampling CASCADE;
DROP TABLE IF EXISTS mortality_record CASCADE;
DROP TABLE IF EXISTS deep_cleaning_record CASCADE;
DROP TABLE IF EXISTS cleaning_record CASCADE;
DROP TABLE IF EXISTS incubation CASCADE;
DROP TABLE IF EXISTS subculturing CASCADE;
DROP TABLE IF EXISTS media_batches CASCADE;
DROP TABLE IF EXISTS autoclave_cycles CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'indoor-operator', 'outdoor-operator', 'sales-analyst')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operators Table
CREATE TABLE operators (
  id SERIAL PRIMARY KEY,
  short_name VARCHAR(10) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  section VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BATCH MANAGEMENT (CENTRAL TABLE)
-- ============================================

CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  batch_code VARCHAR(100) UNIQUE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  initial_quantity INT DEFAULT 0,
  current_quantity INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'in-progress', 'completed', 'disposed')),
  current_stage VARCHAR(100) DEFAULT 'subculturing',
  created_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_code ON batches(batch_code);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_crop ON batches(crop_name);

-- ============================================
-- INDOOR MODULE TABLES
-- ============================================

-- Autoclave Cycles
CREATE TABLE autoclave_cycles (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  media_code VARCHAR(50),
  operator_name VARCHAR(100),
  type_of_media VARCHAR(100),
  autoclave_on_time TIME,
  media_loading_time TIME,
  pressure_time TIME,
  off_time TIME,
  open_time TIME,
  media_total VARCHAR(50),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Batches
CREATE TABLE media_batches (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  media_code VARCHAR(50),
  operator_name VARCHAR(100),
  quantity VARCHAR(50),
  bottles INT,
  contamination TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subculturing (Creates Batches)
CREATE TABLE subculturing (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  transfer_date DATE NOT NULL,
  stage_number VARCHAR(50),
  media_code VARCHAR(50),
  no_of_bottles INT,
  no_of_shoots INT,
  operator_name VARCHAR(100),
  mortality VARCHAR(50),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subculturing_batch ON subculturing(batch_id);

-- Incubation
CREATE TABLE incubation (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  subculture_date DATE NOT NULL,
  stage VARCHAR(50),
  media_code VARCHAR(50),
  operator_name VARCHAR(100),
  no_of_bottles INT,
  no_of_shoots INT,
  temp VARCHAR(50),
  humidity VARCHAR(50),
  photo_period VARCHAR(50),
  light_intensity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incubation_batch ON incubation(batch_id);

-- Cleaning Record
CREATE TABLE cleaning_record (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  area VARCHAR(100),
  operator_name VARCHAR(100),
  cleaning_agent VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deep Cleaning Record
CREATE TABLE deep_cleaning_record (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  area VARCHAR(100),
  operator_name VARCHAR(100),
  cleaning_agent VARCHAR(100),
  duration VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mortality Record
CREATE TABLE mortality_record (
  id SERIAL PRIMARY KEY,
  batch_id INT REFERENCES batches(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  vessel_count INT,
  type_of_mortality VARCHAR(100),
  possible_source TEXT,
  disposal_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mortality_batch ON mortality_record(batch_id);

-- Sampling
CREATE TABLE sampling (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  sample_date DATE NOT NULL,
  stage VARCHAR(50),
  sent_date DATE,
  received_date DATE,
  status VARCHAR(50),
  govt_certificate VARCHAR(10),
  certificate_no VARCHAR(100),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sampling_batch ON sampling(batch_id);

-- ============================================
-- OUTDOOR MODULE TABLES
-- ============================================

-- Primary Hardening
CREATE TABLE primary_hardening (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  tunnel VARCHAR(50),
  tray_count INT DEFAULT 0,
  plants INT DEFAULT 0,
  workers INT DEFAULT 0,
  waiting_period INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_primary_batch ON primary_hardening(batch_id);
CREATE INDEX idx_primary_tunnel ON primary_hardening(tunnel);

-- Tray Details (for Primary Hardening)
CREATE TABLE tray_details (
  id SERIAL PRIMARY KEY,
  primary_hardening_id INT NOT NULL REFERENCES primary_hardening(id) ON DELETE CASCADE,
  tray_name VARCHAR(50) NOT NULL,
  cavity_count INT NOT NULL,
  quantity INT NOT NULL,
  plants_per_tray INT GENERATED ALWAYS AS (cavity_count * quantity) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tray_details_primary ON tray_details(primary_hardening_id);

-- Secondary Hardening
CREATE TABLE secondary_hardening (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  transfer_date DATE NOT NULL,
  from_location VARCHAR(200),
  to_bed VARCHAR(100),
  plants INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_secondary_batch ON secondary_hardening(batch_id);

-- Shifting
CREATE TABLE shifting (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  old_location VARCHAR(200),
  new_location VARCHAR(200),
  plants INT DEFAULT 0,
  reason VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifting_batch ON shifting(batch_id);

-- Outdoor Mortality
CREATE TABLE outdoor_mortality (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  location VARCHAR(200),
  mortality_type VARCHAR(50),
  affected_plants INT DEFAULT 0,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outdoor_mortality_batch ON outdoor_mortality(batch_id);

-- Fertilization
CREATE TABLE fertilization (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  activity_type VARCHAR(100),
  materials_used VARCHAR(200),
  quantity VARCHAR(50),
  operator_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fertilization_batch ON fertilization(batch_id);

-- Holding Area
CREATE TABLE holding_area (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  location VARCHAR(100),
  plants INT DEFAULT 0,
  status VARCHAR(50),
  expected_dispatch DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holding_batch ON holding_area(batch_id);

-- Outdoor Sampling
CREATE TABLE outdoor_sampling (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  sample_date DATE NOT NULL,
  stage VARCHAR(50),
  sent_date DATE,
  received_date DATE,
  status VARCHAR(20),
  govt_certificate VARCHAR(10),
  certificate_no VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outdoor_sampling_batch ON outdoor_sampling(batch_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Users
INSERT INTO users (username, password, role) VALUES
('owner@seemabiotech.com', 'Password123', 'owner'),
('indoor@seemabiotech.com', 'Password123', 'indoor-operator'),
('outdoor@seemabiotech.com', 'Password123', 'outdoor-operator');

-- Insert Operators
INSERT INTO operators (short_name, first_name, last_name, role, section, is_active) VALUES
('RKS', 'Rajesh', 'Kumar', 'Senior Operator', 'Media Preparation', true),
('PS', 'Priya', 'Sharma', 'Operator', 'Subculturing', true),
('AP', 'Amit', 'Patel', 'Operator', 'Incubation', true);

-- Insert Sample Batches
INSERT INTO batches (batch_code, crop_name, initial_quantity, current_quantity, status, current_stage, created_date) VALUES
('SB-01', 'BANANA', 120, 120, 'active', 'subculturing', '2026-02-15'),
('MS-01', 'ROSE', 1200, 1200, 'active', 'primary-hardening', '2024-11-01'),
('GR-01', 'GERBERA', 960, 960, 'active', 'secondary-hardening', '2024-11-10');

SELECT '✅ Complete ERP schema with batch management created successfully!' as status;
