-- ============================================
-- COMPLETE DATABASE SCHEMA FOR ERP SYSTEM
-- Seema Biotech - Indoor Operations
-- ============================================

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS mortality_record;
DROP TABLE IF EXISTS deep_cleaning_record;
DROP TABLE IF EXISTS cleaning_record;
DROP TABLE IF EXISTS incubation;
DROP TABLE IF EXISTS subculturing;
DROP TABLE IF EXISTS sampling;
DROP TABLE IF EXISTS media_batches;
DROP TABLE IF EXISTS autoclave_cycles;
DROP TABLE IF EXISTS operators;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. OPERATORS TABLE
-- ============================================
CREATE TABLE operators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  sections JSON NOT NULL COMMENT 'Array of sections: ["Media Preparation", "Subculturing", "Incubation", "Cleaning Record", "Quality Control"]',
  age INT,
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_short_name (short_name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USERS TABLE (Authentication)
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. AUTOCLAVE CYCLES TABLE
-- ============================================
CREATE TABLE autoclave_cycles (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_media_code (media_code),
  INDEX idx_operator (operator_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. MEDIA BATCHES TABLE
-- ============================================
CREATE TABLE media_batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  media_code VARCHAR(50) NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  quantity VARCHAR(20),
  bottles INT DEFAULT 0,
  contamination TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_media_code (media_code),
  INDEX idx_operator (operator_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. SAMPLING TABLE
-- ============================================
CREATE TABLE sampling (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sample_date (sample_date),
  INDEX idx_batch_name (batch_name),
  INDEX idx_crop_name (crop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. SUBCULTURING TABLE
-- ============================================
CREATE TABLE subculturing (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transfer_date (transfer_date),
  INDEX idx_batch_name (batch_name),
  INDEX idx_operator (operator_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. INCUBATION TABLE
-- ============================================
CREATE TABLE incubation (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subculture_date (subculture_date),
  INDEX idx_batch_name (batch_name),
  INDEX idx_operator (operator_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. CLEANING RECORD TABLE
-- ============================================
CREATE TABLE cleaning_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  operator_name VARCHAR(50) NOT NULL,
  area_cleaned TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_operator (operator_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. DEEP CLEANING RECORD TABLE
-- ============================================
CREATE TABLE deep_cleaning_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  operator VARCHAR(50) NOT NULL,
  instrument_cleaned TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_operator (operator)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. MORTALITY RECORD TABLE
-- ============================================
CREATE TABLE mortality_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  vessel_count INT DEFAULT 0,
  type_of_mortality VARCHAR(100),
  possible_source TEXT,
  disposal_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_batch_name (batch_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample operators
INSERT INTO operators (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) VALUES
('Ravi', 'Kumar', 'Singh', 'RKS', 'Senior Technician', '["Media Preparation", "Subculturing"]', 28, 'Male', TRUE),
('Aisha', NULL, 'Bano', 'AB', 'Lab Assistant', '["Cleaning Record", "Quality Control"]', 24, 'Female', TRUE),
('Priya', 'Devi', 'Sharma', 'PDS', 'Supervisor', '["Media Preparation", "Incubation", "Quality Control"]', 32, 'Female', TRUE),
('Amit', NULL, 'Patel', 'AP', 'QC Officer', '["Quality Control"]', 30, 'Male', TRUE),
('Suresh', 'Kumar', 'Verma', 'SKV', 'Lab Assistant', '["Subculturing", "Incubation"]', 26, 'Male', TRUE);

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin'),
('user', '$2b$10$YourHashedPasswordHere', 'user');

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Active Operators by Section
CREATE OR REPLACE VIEW v_operators_by_section AS
SELECT 
  o.id,
  o.short_name,
  CONCAT(o.first_name, ' ', IFNULL(o.middle_name, ''), ' ', o.last_name) as full_name,
  o.role,
  o.sections,
  o.is_active
FROM operators o
WHERE o.is_active = TRUE
ORDER BY o.short_name;

-- View: Recent Activity Summary
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
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Get operators by section
CREATE PROCEDURE sp_get_operators_by_section(IN section_name VARCHAR(100))
BEGIN
  SELECT * FROM operators 
  WHERE JSON_CONTAINS(sections, JSON_QUOTE(section_name))
  AND is_active = TRUE
  ORDER BY short_name;
END //

-- Get dashboard statistics
CREATE PROCEDURE sp_get_dashboard_stats(IN from_date DATE, IN to_date DATE)
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM autoclave_cycles WHERE date BETWEEN from_date AND to_date) as autoclave_count,
    (SELECT COUNT(*) FROM media_batches WHERE date BETWEEN from_date AND to_date) as batch_count,
    (SELECT COUNT(*) FROM subculturing WHERE transfer_date BETWEEN from_date AND to_date) as subculture_count,
    (SELECT COUNT(*) FROM incubation WHERE subculture_date BETWEEN from_date AND to_date) as incubation_count,
    (SELECT COUNT(*) FROM sampling WHERE sample_date BETWEEN from_date AND to_date) as sampling_count,
    (SELECT COUNT(*) FROM mortality_record WHERE date BETWEEN from_date AND to_date) as mortality_count,
    (SELECT COUNT(*) FROM operators WHERE is_active = TRUE) as active_operators;
END //

DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_autoclave_date_media ON autoclave_cycles(date, media_code);
CREATE INDEX idx_batch_date_media ON media_batches(date, media_code);
CREATE INDEX idx_subculture_date_batch ON subculturing(transfer_date, batch_name);
CREATE INDEX idx_incubation_date_batch ON incubation(subculture_date, batch_name);
CREATE INDEX idx_sampling_date_batch ON sampling(sample_date, batch_name);

-- ============================================
-- GRANTS (Adjust based on your user setup)
-- ============================================

-- GRANT ALL PRIVILEGES ON erp_database.* TO 'erp_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- END OF SCHEMA
-- ============================================
