-- ============================================
-- OUTDOOR MODULE DATABASE SCHEMA
-- PostgreSQL Compatible
-- ============================================

-- 1. PRIMARY HARDENING
CREATE TABLE primary_hardening (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  tunnel VARCHAR(50),
  tray VARCHAR(50),
  cavity VARCHAR(50),
  plants INT DEFAULT 0,
  workers INT DEFAULT 0,
  waiting_period INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_primary_date ON primary_hardening(date);
CREATE INDEX idx_primary_batch ON primary_hardening(batch_name);
CREATE INDEX idx_primary_crop ON primary_hardening(crop_name);

-- 2. SECONDARY HARDENING
CREATE TABLE secondary_hardening (
  id SERIAL PRIMARY KEY,
  transfer_date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  from_location VARCHAR(200),
  to_bed VARCHAR(100),
  plants INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_secondary_date ON secondary_hardening(transfer_date);
CREATE INDEX idx_secondary_batch ON secondary_hardening(batch_name);
CREATE INDEX idx_secondary_crop ON secondary_hardening(crop_name);

-- 3. SHIFTING
CREATE TABLE shifting (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  old_location VARCHAR(200),
  new_location VARCHAR(200),
  plants INT DEFAULT 0,
  reason VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_shifting_date ON shifting(date);
CREATE INDEX idx_shifting_batch ON shifting(batch_name);
CREATE INDEX idx_shifting_crop ON shifting(crop_name);

-- 4. OUTDOOR MORTALITY
CREATE TABLE outdoor_mortality (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  mortality_type VARCHAR(50),
  affected_plants INT DEFAULT 0,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_outdoor_mortality_date ON outdoor_mortality(date);
CREATE INDEX idx_outdoor_mortality_batch ON outdoor_mortality(batch_name);
CREATE INDEX idx_outdoor_mortality_crop ON outdoor_mortality(crop_name);

-- 5. FERTILIZATION
CREATE TABLE fertilization (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100),
  materials_used VARCHAR(200),
  quantity VARCHAR(50),
  operator_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_fertilization_date ON fertilization(date);
CREATE INDEX idx_fertilization_batch ON fertilization(batch_name);
CREATE INDEX idx_fertilization_crop ON fertilization(crop_name);

-- 6. HOLDING AREA
CREATE TABLE holding_area (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  plants INT DEFAULT 0,
  status VARCHAR(50),
  expected_dispatch DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_holding_date ON holding_area(date);
CREATE INDEX idx_holding_batch ON holding_area(batch_name);
CREATE INDEX idx_holding_crop ON holding_area(crop_name);

-- 7. OUTDOOR SAMPLING
CREATE TABLE outdoor_sampling (
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
CREATE INDEX idx_outdoor_sampling_date ON outdoor_sampling(sample_date);
CREATE INDEX idx_outdoor_sampling_batch ON outdoor_sampling(batch_name);
CREATE INDEX idx_outdoor_sampling_crop ON outdoor_sampling(crop_name);

-- Sample Data
INSERT INTO primary_hardening (date, crop_name, batch_name, tunnel, tray, cavity, plants, workers, waiting_period, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'T1', 'Tray 12', 'C1-C50', 1200, 4, 14, 'Good acclimatization'),
('2024-11-17', 'Gerbera', 'B-2024-1144', 'T2', 'Tray 8', 'C1-C40', 960, 3, 14, 'Monitoring growth');

INSERT INTO secondary_hardening (transfer_date, crop_name, batch_name, from_location, to_bed, plants, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'T1 / Tray 12 / C1-C50', 'Bed B1', 1200, 'Transferred after 14 days primary'),
('2024-11-16', 'Gerbera', 'B-2024-1143', 'T2 / Tray 8 / C1-C40', 'Bed B3', 960, 'Good root development');

INSERT INTO shifting (date, crop_name, batch_name, old_location, new_location, plants, reason, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'T1 / Tray 5 / C10-C20', 'T2 / Tray 12 / C1-C11', 264, 'Better light exposure', 'Completed successfully');

INSERT INTO outdoor_mortality (date, crop_name, batch_name, location, mortality_type, affected_plants, action_taken, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1142', 'T3 / Tray 6 / C12-C20', 'Fungal', 47, 'Removed & disposed, area sterilized', 'High humidity suspected cause');

INSERT INTO fertilization (date, crop_name, batch_name, activity_type, materials_used, quantity, operator_name, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'Fertilization', 'NPK 19:19:19', '5kg', 'Rajesh Kumar', 'Foliar spray applied');

INSERT INTO holding_area (date, crop_name, batch_name, location, plants, status, expected_dispatch, notes) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'Holding Area A', 1200, 'Ready', '2024-11-25', 'Quality checked');

INSERT INTO outdoor_sampling (sample_date, crop_name, batch_name, stage, sent_date, received_date, status, govt_certificate, certificate_no, reason) VALUES
('2024-11-18', 'Rose', 'B-2024-1145', 'Secondary Hardening', '2024-11-19', '2024-11-22', 'Approved', 'Yes', 'CERT-OUT-001', NULL);

SELECT '✅ Outdoor module tables created successfully!' as status;
