-- Add denormalized batch_code and crop_name columns to all tables
-- This makes queries simpler and avoids complex JOINs

-- INDOOR TABLES
ALTER TABLE subculturing ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE subculturing ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE incubation ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE incubation ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE sampling ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);
ALTER TABLE sampling ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);

ALTER TABLE mortality_record ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);

-- OUTDOOR TABLES
ALTER TABLE primary_hardening ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE primary_hardening ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE secondary_hardening ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE secondary_hardening ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE shifting ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE shifting ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE outdoor_mortality ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE outdoor_mortality ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE fertilization ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE fertilization ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE holding_area ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE holding_area ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

ALTER TABLE outdoor_sampling ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE outdoor_sampling ADD COLUMN IF NOT EXISTS crop_name VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subculturing_batch_code ON subculturing(batch_code);
CREATE INDEX IF NOT EXISTS idx_incubation_batch_code ON incubation(batch_code);
CREATE INDEX IF NOT EXISTS idx_sampling_batch_code ON sampling(batch_code);
CREATE INDEX IF NOT EXISTS idx_primary_batch_code ON primary_hardening(batch_code);
CREATE INDEX IF NOT EXISTS idx_secondary_batch_code ON secondary_hardening(batch_code);
CREATE INDEX IF NOT EXISTS idx_shifting_batch_code ON shifting(batch_code);
CREATE INDEX IF NOT EXISTS idx_outdoor_mortality_batch_code ON outdoor_mortality(batch_code);
CREATE INDEX IF NOT EXISTS idx_fertilization_batch_code ON fertilization(batch_code);
CREATE INDEX IF NOT EXISTS idx_holding_batch_code ON holding_area(batch_code);
CREATE INDEX IF NOT EXISTS idx_outdoor_sampling_batch_code ON outdoor_sampling(batch_code);

SELECT '✅ Denormalized columns added successfully!' as status;
