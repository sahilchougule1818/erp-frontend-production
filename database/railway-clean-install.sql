-- ============================================
-- CLEAN DATABASE SCHEMA FOR RAILWAY
-- Matches Frontend Modules Exactly
-- ============================================

-- Drop ALL existing tables
DROP TABLE IF EXISTS mortality_record CASCADE;
DROP TABLE IF EXISTS deep_cleaning_record CASCADE;
DROP TABLE IF EXISTS cleaning_record CASCADE;
DROP TABLE IF EXISTS incubation CASCADE;
DROP TABLE IF EXISTS subculturing CASCADE;
DROP TABLE IF EXISTS sampling CASCADE;
DROP TABLE IF EXISTS media_batches CASCADE;
DROP TABLE IF EXISTS autoclave_cycles CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS quality_control CASCADE;
DROP TABLE IF EXISTS operators_backup CASCADE;

-- ============================================
-- FRONTEND MODULES (What Actually Exists):
-- 1. Media Preparation (autoclave_cycles + media_batches)
-- 2. Subculturing (subculturing)
-- 3. Incubation (incubation + mortality_record)
-- 4. Cleaning Record (cleaning_record + deep_cleaning_record)
-- 5. Sampling (sampling) - This is the QC module
-- 6. Operator Master (operators)
-- ============================================

-- ============================================
-- 1. OPERATORS TABLE
-- ============================================
CREATE TABLE operators (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  sections JSONB NOT NULL,
  age INT,
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operators_short_name ON operators(short_name);
CREATE INDEX idx_operators_is_active ON operators(is_active);

COMMENT ON TABLE operators IS 'Operator Master - manages all operators';
COMMENT ON COLUMN operators.sections IS 'Valid sections: ["Media Preparation", "Subculturing", "Incubation", "Cleaning Record", "Sampling"]';

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'indoor-operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);

COMMENT ON TABLE users IS 'User authentication and authorization';
COMMENT ON COLUMN users.role IS 'Valid roles: owner, indoor-operator, outdoor-operator, sales-analyst';

-- ============================================
-- 3. AUTOCLAVE CYCLES TABLE
-- Module: Media Preparation > Autoclave Cycle
-- ============================================
CREATE TABLE autoclave_cycles (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  media_code VARCHAR(50) NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  type_of_media VARCHAR(100),
  autoclave_on_time TIME,
  media_loading_time TIME,
  pressure_time TIME,
  off_time TIME,
  open_time TIME,
  media_total VARCHAR(20),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_autoclave_date ON autoclave_cycles(date);
CREATE INDEX idx_autoclave_media_code ON autoclave_cycles(media_code);
CREATE INDEX idx_autoclave_operator ON autoclave_cycles(operator_name);
CREATE INDEX idx_autoclave_date_media ON autoclave_cycles(date, media_code);

COMMENT ON TABLE autoclave_cycles IS 'Media Preparation - Autoclave Cycle tracking';

-- ============================================
-- 4. MEDIA BATCHES TABLE
-- Module: Media Preparation > Media Batch
-- ============================================
CREATE TABLE media_batches (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  media_code VARCHAR(50) NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  quantity VARCHAR(20),
  bottles INT DEFAULT 0,
  contamination TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_date ON media_batches(date);
CREATE INDEX idx_batches_media_code ON media_batches(media_code);
CREATE INDEX idx_batches_operator ON media_batches(operator_name);
CREATE INDEX idx_batches_date_media ON media_batches(date, media_code);

COMMENT ON TABLE media_batches IS 'Media Preparation - Media Batch tracking';

-- ============================================
-- 5. SUBCULTURING TABLE
-- Module: Subculturing
-- ============================================
CREATE TABLE subculturing (
  id SERIAL PRIMARY KEY,
  transfer_date DATE NOT NULL,
  stage_number VARCHAR(50) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  media_code VARCHAR(50) NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  no_of_bottles INT DEFAULT 0,
  no_of_shoots INT DEFAULT 0,
  operator_name VARCHAR(50) NOT NULL,
  mortality VARCHAR(50),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subculturing_transfer_date ON subculturing(transfer_date);
CREATE INDEX idx_subculturing_batch_name ON subculturing(batch_name);
CREATE INDEX idx_subculturing_operator ON subculturing(operator_name);
CREATE INDEX idx_subculturing_date_batch ON subculturing(transfer_date, batch_name);

COMMENT ON TABLE subculturing IS 'Subculturing - Plant transfer operations';

-- ============================================
-- 6. INCUBATION TABLE
-- Module: Incubation > Incubation Register
-- ============================================
CREATE TABLE incubation (
  id SERIAL PRIMARY KEY,
  subculture_date DATE NOT NULL,
  stage VARCHAR(50) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  media_code VARCHAR(50) NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  no_of_bottles INT DEFAULT 0,
  no_of_shoots INT DEFAULT 0,
  temp VARCHAR(20),
  humidity VARCHAR(20),
  photo_period VARCHAR(20),
  light_intensity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incubation_subculture_date ON incubation(subculture_date);
CREATE INDEX idx_incubation_batch_name ON incubation(batch_name);
CREATE INDEX idx_incubation_operator ON incubation(operator_name);
CREATE INDEX idx_incubation_date_batch ON incubation(subculture_date, batch_name);

COMMENT ON TABLE incubation IS 'Incubation - Incubation Register with environmental conditions';

-- ============================================
-- 7. MORTALITY RECORD TABLE
-- Module: Incubation > Mortality Record
-- ============================================
CREATE TABLE mortality_record (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  vessel_count INT DEFAULT 0,
  type_of_mortality VARCHAR(100),
  possible_source TEXT,
  disposal_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mortality_date ON mortality_record(date);
CREATE INDEX idx_mortality_batch_name ON mortality_record(batch_name);

COMMENT ON TABLE mortality_record IS 'Incubation - Mortality Record and disposal tracking';

-- ============================================
-- 8. CLEANING RECORD TABLE
-- Module: Cleaning Record > Cleaning Record
-- ============================================
CREATE TABLE cleaning_record (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  area_cleaned TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cleaning_date ON cleaning_record(date);
CREATE INDEX idx_cleaning_operator ON cleaning_record(operator_name);

COMMENT ON TABLE cleaning_record IS 'Cleaning Record - Daily cleaning log';

-- ============================================
-- 9. DEEP CLEANING RECORD TABLE
-- Module: Cleaning Record > Deep Cleaning Record
-- ============================================
CREATE TABLE deep_cleaning_record (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  operator VARCHAR(50) NOT NULL,
  instrument_cleaned TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deep_cleaning_date ON deep_cleaning_record(date);
CREATE INDEX idx_deep_cleaning_operator ON deep_cleaning_record(operator);

COMMENT ON TABLE deep_cleaning_record IS 'Cleaning Record - Deep cleaning and instrument sterilization';

-- ============================================
-- 10. SAMPLING TABLE
-- Module: Sampling (Quality Control)
-- ============================================
CREATE TABLE sampling (
  id SERIAL PRIMARY KEY,
  sample_date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
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

CREATE INDEX idx_sampling_sample_date ON sampling(sample_date);
CREATE INDEX idx_sampling_batch_name ON sampling(batch_name);
CREATE INDEX idx_sampling_crop_name ON sampling(crop_name);
CREATE INDEX idx_sampling_date_batch ON sampling(sample_date, batch_name);

COMMENT ON TABLE sampling IS 'Sampling - Quality control and government certification';

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample operators with CORRECT sections
INSERT INTO operators (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) VALUES
('Ravi', 'Kumar', 'Singh', 'RKS', 'Senior Technician', '["Media Preparation", "Subculturing"]', 28, 'Male', TRUE),
('Aisha', NULL, 'Bano', 'AB', 'Lab Assistant', '["Cleaning Record", "Sampling"]', 24, 'Female', TRUE),
('Priya', 'Devi', 'Sharma', 'PDS', 'Supervisor', '["Media Preparation", "Incubation", "Sampling"]', 32, 'Female', TRUE),
('Amit', NULL, 'Patel', 'AP', 'QC Officer', '["Sampling"]', 30, 'Male', TRUE),
('Suresh', 'Kumar', 'Verma', 'SKV', 'Lab Assistant', '["Subculturing", "Incubation"]', 26, 'Male', TRUE);

-- Insert default users
INSERT INTO users (username, password, role) VALUES
('owner@seemabiotech.com', 'Owner123', 'owner'),
('indoor@seemabiotech.com', 'Indoor123', 'indoor-operator'),
('outdoor@seemabiotech.com', 'Outdoor123', 'outdoor-operator'),
('sales@seemabiotech.com', 'Sales123', 'sales-analyst');

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_operators_by_section AS
SELECT 
  o.id,
  o.short_name,
  CONCAT(o.first_name, ' ', COALESCE(o.middle_name, ''), ' ', o.last_name) as full_name,
  o.role,
  o.sections,
  o.is_active
FROM operators o
WHERE o.is_active = TRUE
ORDER BY o.short_name;

CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
  'Autoclave' as activity_type,
  date as activity_date,
  media_code as reference,
  operator_name as operator,
  created_at
FROM autoclave_cycles
UNION ALL
SELECT 
  'Media Batch' as activity_type,
  date as activity_date,
  media_code as reference,
  operator_name as operator,
  created_at
FROM media_batches
UNION ALL
SELECT 
  'Subculturing' as activity_type,
  transfer_date as activity_date,
  batch_name as reference,
  operator_name as operator,
  created_at
FROM subculturing
ORDER BY created_at DESC
LIMIT 100;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Database setup complete!' as status;
SELECT 'Tables created:' as info;
\dt

SELECT 'Sample operators:' as info;
SELECT short_name, role, sections FROM operators;
