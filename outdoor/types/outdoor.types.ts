// ─── Core batch type — mirrors OutdoorModule.batches after refactor ───────────

export interface Batch {
  id: number;
  batch_code: string;
  plant_name: string;
  current_phase: BatchPhase;
  current_tunnel: string | null;
  current_source_table: string;
  current_source_id: number;
  initial_plants: number;           // was: plants
  total_mortality: number;
  total_plants: number;             // generated: initial_plants - total_mortality
  available_plants: number;         // generated: initial_plants - sold_plants - total_mortality
  state: 'ACTIVE' | 'HOLDING' | 'SOLD';  // computed: smart state logic
  status: 'active' | 'completed' | 'discarded';
  is_in_holding_area: boolean;      // was: is_holding (INTEGER 0/1) - legacy
  is_sampled: 'n' | 's' | 'c';
  is_sold: boolean;                 // legacy
  is_reserved?: boolean;
  sold_plants: number;
  current_phase_sold: number;
  current_age: number;
  phase_display: string;
  current_action?: string;
  last_event_type?: string;
  created_at: string;
  updated_at: string;
}

// ─── Phase tables — immutable snapshots, no state/departed_at ─────────────────

export interface PhaseRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  initial_plants: number;           // was: plants
  mortality_count: number;
  sold_count: number;
  available_plants: number;
  trays: TrayItem[] | null;
  event_code: string;               // was: event_id
  arrived_at: string | null;
  age_at_arrival: number | null;
  current_age: number | null;
  workers: WorkerSnapshot[];
  created_at: string;
  updated_at: string;
}

export interface PrimaryHardeningRecord extends PhaseRecord {
  current_tunnel: string;
  waiting_days: number;             // was: waiting_period
}

export interface SecondaryHardeningRecord extends PhaseRecord {
  current_tunnel: string;
  previous_tunnel: string | null;
  waiting_days: number;             // was: waiting_period
}

// tunnel_shifts is now a movement journal, not a phase table
export interface MovementJournalRecord {
  id: number;
  batch_code: string;
  movement_type: 'IMPORT' | 'SHIFT' | 'TRANSITION' | 'SALE';
  from_location: string | null;
  to_location: string | null;
  plants_at_entry: number;
  event_code: string;
  moved_at: string;
  plant_name: string;
  current_phase: BatchPhase;
  current_tunnel: string | null;
  workers: WorkerSnapshot[];
}

export interface HoldingAreaRecord extends PhaseRecord {
  previous_tunnel: string;          // no current_tunnel — holding area has none
  source_phase: BatchPhase;
}

// ─── Tunnel — mirrors OutdoorModule.tunnels after refactor ────────────────

export interface Tunnel {
  id: number;
  name: string;                     // was: tunnel_name
  capacity: number;
  current_occupancy: number;
  available_space: number;          // generated
  is_active: boolean;
}

// ─── Workers ──────────────────────────────────────────────────────────────

export interface Worker {
  id: number;
  short_name: string;
  first_name: string;
  last_name: string;
  role: string | null;
  section: string | null;
  is_active: boolean;
}

export interface WorkerSnapshot {
  worker_id: number;
  worker_shortname: string;
  first_name: string;
  last_name: string;
}

// ─── Fertilization ────────────────────────────────────────────────────────

export interface FertilizationRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  current_phase: BatchPhase;
  current_tunnel: string | null;
  fertilizer_name: string;
  quantity: number;                 // was varchar, now NUMERIC
  event_code: string;               // was: event_id
  created_at: string;
  workers: string | null;
}

// ─── Sampling ─────────────────────────────────────────────────────────────

export interface SamplingSubmission {              // was: CreateSampling
  id: number;
  batch_code: string;
  plant_name: string;
  current_phase: BatchPhase;
  current_tunnel: string;
  sample_date: string;
  notes: string | null;
  plant_age_at_sampling: number | null;
  created_at: string;
}

export interface SamplingResult {                  // was: ReportSampling
  id: number;
  batch_code: string;
  received_date: string | null;
  status: 'Yes' | 'No';
  certificate_number: string | null;              // was: certificate_no
  government_digital_code: string | null;
  reason: string | null;
  created_at: string;
}

// ─── Mortality — from mortality_records table & v_mortality_history view ──────

export interface MortalityHistoryRecord {
  batch_code: string;
  plant_name: string;
  phase_table: string;
  tunnel: string | null;
  mortality_count: number;
  reason: string | null;
  recorded_at: string;
  event_code: string;
}

// ─── Enums / unions ───────────────────────────────────────────────────────

export type BatchPhase =
  | 'primary_hardening'
  | 'secondary_hardening'
  | 'holding_area';

export type SampledStatus = 'n' | 's' | 'c';

// ─── API Payloads ──────────────────────────────────────────────────────────

export interface WorkerRef {
  id: number;
  name?: string;
  short_name?: string;
  role?: string;
}

export interface ShiftPayload {
  batchCode: string;
  newTunnel: string;
  plants: number;
  mortalityCount?: number;
  reason?: string;
  operators: WorkerRef[];
  trays?: any[];
}

export interface TransitionPayload {
  batchCode: string;
  targetPhase: string;
  newTunnel: string;
  plants: number;
  mortalityCount?: number;
  reason?: string;
  operators: WorkerRef[];
  trays?: any[];
}

export interface UndoPayload {
  batchCode: string;
  relocationTunnel?: string;
}

// ─── Undo types ───────────────────────────────────────────────────────────

export interface UndoPreview {
  canUndo: boolean;
  isFirstRecord: boolean;
  isUndoLocked?: boolean;
  lockReasons?: string[];
  previousHasSpace?: boolean;
  undo_description?: string;
  previousState?: {
    phase: BatchPhase;
    tunnel: string;
    plants: number;
  };
  currentState?: {
    phase: BatchPhase;
    tunnel: string;
    plants: number;
  };
  tunnelOptions?: TunnelOption[];
  autoSelectedTunnel?: string;
  message?: string;
}

export interface TunnelOption {
  name: string;
  available_space: number;
  is_original: boolean;
  has_enough_space: boolean;
}

// ─── Misc ─────────────────────────────────────────────────────────────────

export interface TrayItem {
  cavityCount: number;
  count: number;
}

export interface DashboardStats {
  primary_count: number;
  secondary_count: number;
  holding_count: number;
  total_mortality: number;
}
