export interface Batch {
  id: number;
  batch_code: string;
  plant_name: string;
  phase: string;
  stage: string;
  status: string;
  qty_in: number;
  qty_contaminated: number;
  qty_sold: number;
  qty_available: number;
  total_qty_contaminated: number;
  total_qty_sold: number;
  total_qty_rooted: number;
  current_age: number;
  phase_display: string;
  last_event_type: string;
  event_count: number;
  state: 'ACTIVE' | 'SOLD_OUT' | 'OUTDOOR_READY' | 'AT_OUTDOOR';
  is_sampled: 'n' | 's' | 'c';
  lab_number?: number;
  lab_name?: string;
  current_source_table?: string;
  current_source_id?: number;
  qty_inherited?: number;
}

export interface SubcultureRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  event_code: string;
  current_stage: string;
  next_stage: string;
  media_code: string;
  qty_inherited: number;
  qty_in: number;
  qty_contaminated: number;
  qty_sold: number;
  qty_available: number;
  notes: string;
  state: 'ACTIVE' | 'COMPLETED';
  created_at: string;
  departed_at: string | null;
  operators: OperatorRef[];
}

export interface IncubationRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  event_code: string;
  stage: string;
  qty_in: number;
  qty_contaminated: number;
  qty_sold: number;
  qty_available: number;
  incubation_period: number;
  temperature: number | null;
  humidity: number | null;
  light_intensity: number | null;
  state: 'ACTIVE' | 'COMPLETED' | 'SOLD_OUT';
  created_at: string;
  departed_at: string | null;
  operators: OperatorRef[];
}

export interface ContaminationRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  phase: string;
  stage: string;
  qty_contaminated: number;
  qty_in: number;
  qty_available: number;
  created_at: string;
  departed_at: string | null;
  state: string;
  event_code: string;
}

export interface Operator {
  id: number;
  short_name: string;
  first_name: string;
  last_name: string;
  role: string;
  section: string;
  is_active: boolean;
}

export interface OperatorRef {
  operator_id: number;
  short_name: string;
  name?: string;
  role: string;
}

export interface SamplingSubmission {
  id: number;
  batch_code: string;
  plant_name: string;
  current_stage: string;
  current_phase: string;
  sample_date: string;
  notes: string;
  plant_age_at_sampling: number;
}

export interface SamplingResult {
  id: number;
  batch_code: string;
  received_date: string;
  status: string;
  certificate_number: string;    // was certificate_number
  government_digital_code: string;
  reason: string;
}

export interface UndoPreview {
  canUndo: boolean;
  isFirstRecord: boolean;
  eventType: string;
  message: string;
  previousState?: { phase: string; stage: string; bottles: number };
  currentState?: { phase: string; stage: string; bottles: number };
}
