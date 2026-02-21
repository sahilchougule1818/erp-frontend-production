-- ============================================================================
-- ERP DATABASE SCHEMA - SEEMA BIOTECH
-- Comprehensive Schema with Cycle Tracking & Zone Management
-- ============================================================================

-- ============================================================================
-- 1. MASTER TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operators Table
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. BATCH MASTER TABLE (The Gatekeeper)
-- ============================================================================

CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(100) UNIQUE NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    -- Plant Tracking
    initial_number_of_plants INTEGER NOT NULL,
    current_number_of_plants INTEGER NOT NULL,
    
    -- Status & Location
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discarded')),
    current_stage VARCHAR(50) NOT NULL,
    
    -- NEW: Cycle & Zone Tracking
    cycle_number INTEGER DEFAULT 1 CHECK (cycle_number >= 1 AND cycle_number <= 8),
    zone VARCHAR(20) DEFAULT 'Indoor' CHECK (zone IN ('Indoor', 'Outdoor')),
    
    -- Lock Mechanism
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP,
    
    -- Timestamps
    created_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_batch_code ON batches(batch_code);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_zone ON batches(zone);
CREATE INDEX idx_batches_cycle ON batches(cycle_number);

-- ============================================================================
-- 3. BATCH LEDGER (Audit Trail with Cycle Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_ledger (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(100) NOT NULL,
    
    -- Stage & Cycle Information
    stage VARCHAR(50) NOT NULL,
    cycle_number INTEGER NOT NULL,
    zone VARCHAR(20) NOT NULL CHECK (zone IN ('Indoor', 'Outdoor')),
    
    -- Plant Movement
    number_of_plants INTEGER NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE', 'MOVE', 'DISCARD')),
    
    -- Source Tracking
    source_table VARCHAR(50) NOT NULL,
    source_id INTEGER NOT NULL,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

CREATE INDEX idx_batch_ledger_batch_code ON batch_ledger(batch_code);
CREATE INDEX idx_batch_ledger_created_at ON batch_ledger(created_at DESC);
CREATE INDEX idx_batch_ledger_state ON batch_ledger(state);
CREATE INDEX idx_batch_ledger_cycle ON batch_ledger(cycle_number);
CREATE INDEX idx_batch_ledger_zone ON batch_ledger(zone);

-- ============================================================================
-- 4. INDOOR ZONE - SUBCULTURING (with Cycle Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subculturing (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    -- Cycle Information
    cycle_number INTEGER NOT NULL CHECK (cycle_number >= 1 AND cycle_number <= 8),
    zone VARCHAR(20) DEFAULT 'Indoor' CHECK (zone IN ('Indoor', 'Outdoor')),
    
    -- Transfer Details
    transfer_date DATE NOT NULL,
    stage_number VARCHAR(50) NOT NULL,
    media_code VARCHAR(50) NOT NULL,
    
    -- Quantities
    no_of_bottles INTEGER NOT NULL,
    no_of_shoots INTEGER NOT NULL,
    
    -- Operator & Quality
    operator_name VARCHAR(100),
    mortality VARCHAR(50),
    
    -- Stage Tracking
    current_stage VARCHAR(50),
    next_stage VARCHAR(50),
    available_for_outdoor BOOLEAN DEFAULT FALSE,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    -- Notes
    remark TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

CREATE INDEX idx_subculturing_batch_code ON subculturing(batch_code);
CREATE INDEX idx_subculturing_cycle ON subculturing(cycle_number);
CREATE INDEX idx_subculturing_state ON subculturing(state);
CREATE INDEX idx_subculturing_zone ON subculturing(zone);

-- ============================================================================
-- 5. INDOOR ZONE - INCUBATION (with Cycle Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS incubation (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    -- Cycle Information
    cycle_number INTEGER NOT NULL CHECK (cycle_number >= 1 AND cycle_number <= 8),
    zone VARCHAR(20) DEFAULT 'Indoor' CHECK (zone IN ('Indoor', 'Outdoor')),
    
    -- Incubation Details
    incubation_date DATE NOT NULL,
    stage_number VARCHAR(50) NOT NULL,
    no_of_bottles INTEGER NOT NULL,
    
    -- Environment
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    light_intensity VARCHAR(50),
    
    -- Duration
    incubation_period INTEGER,
    expected_completion_date DATE,
    
    -- Stage Tracking
    current_stage VARCHAR(50),
    next_stage VARCHAR(50),
    available_for_outdoor BOOLEAN DEFAULT FALSE,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

CREATE INDEX idx_incubation_batch_code ON incubation(batch_code);
CREATE INDEX idx_incubation_cycle ON incubation(cycle_number);
CREATE INDEX idx_incubation_state ON incubation(state);
CREATE INDEX idx_incubation_zone ON incubation(zone);

-- ============================================================================
-- 6. INDOOR ZONE - SUPPORTING TABLES
-- ============================================================================

-- Shifting Table
CREATE TABLE IF NOT EXISTS shifting (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    cycle_number INTEGER NOT NULL,
    zone VARCHAR(20) DEFAULT 'Indoor',
    
    shift_date DATE NOT NULL,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    no_of_bottles INTEGER NOT NULL,
    operator_name VARCHAR(100),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- Sampling Table
CREATE TABLE IF NOT EXISTS sampling (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    cycle_number INTEGER NOT NULL,
    zone VARCHAR(20) DEFAULT 'Indoor',
    
    sampling_date DATE NOT NULL,
    stage VARCHAR(50) NOT NULL,
    sample_size INTEGER NOT NULL,
    contamination_level VARCHAR(50),
    health_status VARCHAR(50),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- Mortality Record Table
CREATE TABLE IF NOT EXISTS mortality_record (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    cycle_number INTEGER NOT NULL,
    zone VARCHAR(20) DEFAULT 'Indoor',
    
    record_date DATE NOT NULL,
    stage VARCHAR(50) NOT NULL,
    mortality_count INTEGER NOT NULL,
    mortality_reason VARCHAR(255),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- Holding Area Table
CREATE TABLE IF NOT EXISTS holding_area (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    cycle_number INTEGER NOT NULL,
    zone VARCHAR(20) DEFAULT 'Indoor',
    
    entry_date DATE NOT NULL,
    no_of_bottles INTEGER NOT NULL,
    location VARCHAR(100),
    expected_exit_date DATE,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- ============================================================================
-- 7. OUTDOOR ZONE - PRIMARY HARDENING
-- ============================================================================

CREATE TABLE IF NOT EXISTS primary_hardening (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    -- Zone Lock (Once here, Indoor is locked)
    zone VARCHAR(20) DEFAULT 'Outdoor' CHECK (zone = 'Outdoor'),
    
    -- Hardening Details
    date DATE NOT NULL,
    tunnel VARCHAR(50),
    workers INTEGER,
    waiting_period INTEGER,
    
    -- Plant Count
    plants INTEGER NOT NULL,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

CREATE INDEX idx_primary_hardening_batch_code ON primary_hardening(batch_code);
CREATE INDEX idx_primary_hardening_state ON primary_hardening(state);
CREATE INDEX idx_primary_hardening_is_deleted ON primary_hardening(is_deleted);

-- Tray Details for Primary Hardening
CREATE TABLE IF NOT EXISTS tray_details (
    id SERIAL PRIMARY KEY,
    primary_hardening_id INTEGER NOT NULL,
    tray_name VARCHAR(50) NOT NULL,
    cavity_count INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_plants INTEGER GENERATED ALWAYS AS (cavity_count * quantity) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (primary_hardening_id) REFERENCES primary_hardening(id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. OUTDOOR ZONE - SECONDARY HARDENING
-- ============================================================================

CREATE TABLE IF NOT EXISTS secondary_hardening (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    zone VARCHAR(20) DEFAULT 'Outdoor' CHECK (zone = 'Outdoor'),
    
    date DATE NOT NULL,
    tunnel VARCHAR(50),
    workers INTEGER,
    waiting_period INTEGER,
    plants INTEGER NOT NULL,
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

CREATE INDEX idx_secondary_hardening_batch_code ON secondary_hardening(batch_code);
CREATE INDEX idx_secondary_hardening_state ON secondary_hardening(state);
CREATE INDEX idx_secondary_hardening_is_deleted ON secondary_hardening(is_deleted);

-- ============================================================================
-- 9. OUTDOOR ZONE - SUPPORTING TABLES
-- ============================================================================

-- Outdoor Mortality Table
CREATE TABLE IF NOT EXISTS outdoor_mortality (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    zone VARCHAR(20) DEFAULT 'Outdoor',
    
    record_date DATE NOT NULL,
    stage VARCHAR(50) NOT NULL,
    mortality_count INTEGER NOT NULL,
    mortality_reason VARCHAR(255),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- Outdoor Sampling Table
CREATE TABLE IF NOT EXISTS outdoor_sampling (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    zone VARCHAR(20) DEFAULT 'Outdoor',
    
    sampling_date DATE NOT NULL,
    stage VARCHAR(50) NOT NULL,
    sample_size INTEGER NOT NULL,
    health_status VARCHAR(50),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- Fertilization Table
CREATE TABLE IF NOT EXISTS fertilization (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    
    zone VARCHAR(20) DEFAULT 'Outdoor',
    
    fertilization_date DATE NOT NULL,
    fertilizer_type VARCHAR(100),
    quantity DECIMAL(10,2),
    application_method VARCHAR(100),
    
    -- State Management (Progress Tracking)
    state VARCHAR(20) DEFAULT 'Active' CHECK (state IN ('Active', 'Completed')),
    
    -- Validity Tracking
    is_deleted INTEGER DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_code) REFERENCES batches(batch_code) ON DELETE CASCADE
);

-- ============================================================================
-- 10. MEDIA & STERILIZATION TABLES
-- ============================================================================

-- Media Batches Table
CREATE TABLE IF NOT EXISTS media_batches (
    id SERIAL PRIMARY KEY,
    media_code VARCHAR(50) UNIQUE NOT NULL,
    media_type VARCHAR(100) NOT NULL,
    preparation_date DATE NOT NULL,
    quantity_prepared DECIMAL(10,2) NOT NULL,
    quantity_used DECIMAL(10,2) DEFAULT 0,
    quantity_remaining DECIMAL(10,2),
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'expired', 'discarded')),
    prepared_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_batches_media_code ON media_batches(media_code);
CREATE INDEX idx_media_batches_status ON media_batches(status);

-- Autoclave Cycles Table
CREATE TABLE IF NOT EXISTS autoclave_cycles (
    id SERIAL PRIMARY KEY,
    cycle_date DATE NOT NULL,
    cycle_number VARCHAR(50) NOT NULL,
    autoclave_id VARCHAR(50),
    start_time TIME,
    end_time TIME,
    temperature DECIMAL(5,2),
    pressure DECIMAL(5,2),
    duration INTEGER,
    load_description TEXT,
    operator_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'aborted')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_autoclave_cycles_cycle_date ON autoclave_cycles(cycle_date DESC);

-- ============================================================================
-- 11. CLEANING & MAINTENANCE TABLES
-- ============================================================================

-- Cleaning Record Table
CREATE TABLE IF NOT EXISTS cleaning_record (
    id SERIAL PRIMARY KEY,
    cleaning_date DATE NOT NULL,
    area VARCHAR(100) NOT NULL,
    cleaning_type VARCHAR(50) CHECK (cleaning_type IN ('routine', 'deep', 'emergency')),
    cleaning_agent VARCHAR(100),
    operator_name VARCHAR(100),
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deep Cleaning Record Table
CREATE TABLE IF NOT EXISTS deep_cleaning_record (
    id SERIAL PRIMARY KEY,
    cleaning_date DATE NOT NULL,
    area VARCHAR(100) NOT NULL,
    cleaning_agent VARCHAR(100),
    operator_name VARCHAR(100),
    duration INTEGER,
    verification_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_shifting_batch_code ON shifting(batch_code);
CREATE INDEX idx_sampling_batch_code ON sampling(batch_code);
CREATE INDEX idx_mortality_batch_code ON mortality_record(batch_code);
CREATE INDEX idx_holding_batch_code ON holding_area(batch_code);
CREATE INDEX idx_outdoor_mortality_batch_code ON outdoor_mortality(batch_code);
CREATE INDEX idx_outdoor_sampling_batch_code ON outdoor_sampling(batch_code);
CREATE INDEX idx_fertilization_batch_code ON fertilization(batch_code);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- NOTES:
-- 1. cycle_number tracks which iteration (1-8) of Sub/Incu the batch is in
-- 2. zone determines if batch is in 'Indoor' or 'Outdoor' processing
-- 3. state tracks PROGRESS: 'Active' (in progress) or 'Completed' (moved to next stage)
-- 4. is_deleted tracks VALIDITY: 0 (valid record) or 1 (deleted/void record)
-- 5. When zone changes to 'Outdoor', Indoor tables become read-only for that batch
-- 6. Deleting an Outdoor record reverts the batch to its last Indoor state
-- 7. batch_ledger maintains complete audit trail with cycle and zone information
-- 8. Query logic: WHERE is_deleted = 0 AND state = 'Active' (show current active records)
-- 9. Rollback logic: Set is_deleted = 1, change predecessor state from 'Completed' to 'Active'
