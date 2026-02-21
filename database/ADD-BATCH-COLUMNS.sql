-- Add batch_code and crop_name columns to all related tables
-- This allows simpler queries without JOINs

-- Subculturing
ALTER TABLE subculturing 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Incubation
ALTER TABLE incubation 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Mortality Record
ALTER TABLE mortality_record 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);

-- Sampling
ALTER TABLE sampling 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Primary Hardening
ALTER TABLE primary_hardening 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Secondary Hardening
ALTER TABLE secondary_hardening 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Shifting
ALTER TABLE shifting 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Outdoor Mortality
ALTER TABLE outdoor_mortality 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Fertilization
ALTER TABLE fertilization 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Holding Area
ALTER TABLE holding_area 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Outdoor Sampling
ALTER TABLE outdoor_sampling 
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

SELECT '✅ Added batch_code and crop_name columns to all tables!' as status;
