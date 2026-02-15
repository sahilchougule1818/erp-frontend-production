-- Step 1: Backup existing operators
CREATE TABLE operators_backup AS SELECT * FROM operators;

-- Step 2: Drop old operators table
DROP TABLE operators;

-- Step 3: Create new operators table with sections
CREATE TABLE operators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  sections JSON NOT NULL,
  age INT,
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 4: Migrate old data to new structure
INSERT INTO operators (first_name, last_name, short_name, role, sections, is_active)
SELECT 
  SUBSTRING_INDEX(name, ' ', 1) as first_name,
  SUBSTRING_INDEX(name, ' ', -1) as last_name,
  UPPER(CONCAT(
    SUBSTRING(SUBSTRING_INDEX(name, ' ', 1), 1, 1),
    SUBSTRING(SUBSTRING_INDEX(name, ' ', -1), 1, 1)
  )) as short_name,
  'Lab Assistant' as role,
  '["Media Preparation", "Subculturing", "Incubation", "Cleaning Record", "Quality Control"]' as sections,
  TRUE as is_active
FROM operators_backup
WHERE type = 'indoor';

-- Step 5: Add sample operators with specific sections
INSERT INTO operators (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) VALUES
('Ravi', 'Kumar', 'Singh', 'RKS', 'Senior Technician', '["Media Preparation", "Subculturing"]', 28, 'Male', TRUE),
('Aisha', NULL, 'Bano', 'AB', 'Lab Assistant', '["Cleaning Record", "Quality Control"]', 24, 'Female', TRUE),
('Priya', 'Devi', 'Sharma', 'PDS', 'Supervisor', '["Media Preparation", "Incubation", "Quality Control"]', 32, 'Female', TRUE),
('Amit', NULL, 'Patel', 'AP', 'QC Officer', '["Quality Control"]', 30, 'Male', TRUE);
