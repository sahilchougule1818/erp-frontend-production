CREATE TABLE IF NOT EXISTS operators (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO operators (first_name, last_name, short_name, role, section, is_active) VALUES
('John', 'Doe', 'JD', 'Technician', 'Autoclave', TRUE),
('Jane', 'Smith', 'JS', 'Supervisor', 'Media Preparation', TRUE),
('Mike', 'Johnson', 'MJ', 'Operator', 'Subculturing', TRUE);
