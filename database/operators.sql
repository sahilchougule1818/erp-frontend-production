-- Operator Master Table
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

-- Sample Data
INSERT INTO operators (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) VALUES
('Ravi', 'Kumar', 'Singh', 'RKS', 'Senior Technician', '["Media Preparation", "Subculturing"]', 28, 'Male', TRUE),
('Aisha', NULL, 'Bano', 'AB', 'Lab Assistant', '["Cleaning Record", "Quality Control"]', 24, 'Female', TRUE),
('Priya', 'Devi', 'Sharma', 'PDS', 'Supervisor', '["Media Preparation", "Incubation", "Quality Control"]', 32, 'Female', TRUE),
('Amit', NULL, 'Patel', 'AP', 'QC Officer', '["Quality Control", "Sampling"]', 30, 'Male', TRUE);
