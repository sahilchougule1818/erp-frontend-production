export interface Batch {
  id: number;
  batch_code: string;
  plant_name: string;
  phase: string;
  stage: string;
  status: string;
  current_bottles_count: number;
  contamination_count: number;
  current_contamination: number;
  total_sold_bottles: number;
  current_stage_sold: number;
  available_bottles: number;
  current_age: number;
  phase_display: string;
  last_event_type: string;
  event_count: number;
  state: 'ACTIVE' | 'AO' | 'TO' | 'SO';
  is_sampled: 'n' | 's' | 'c';
}

export interface SubcultureRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  event_code: string;             // was event_id
  current_stage: string;
  next_stage: string;
  media_code: string;
  current_bottles_count: number;  // before
  new_bottles_count: number;      // after (real input)
  notes: string;                  // was notes
  state: 'ACTIVE' | 'COMPLETED';
  arrived_at: string;
  departed_at: string | null;
  operators: OperatorRef[];
}

export interface IncubationRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  event_code: string;
  stage: string;
  current_bottles_count: number;
  contamination_count: number;
  new_bottles_count: number;      // generated: current - contamination
  incubation_period: number;
  temperature: number | null;
  humidity: number | null;
  light_intensity: number | null;
  state: 'ACTIVE' | 'COMPLETED';
  arrived_at: string;
  departed_at: string | null;
  operators: OperatorRef[];
}

export interface ContaminationRecord {
  id: number;
  batch_code: string;
  plant_name: string;
  phase: string;
  stage: string;
  contamination_count: number;
  current_bottles_count: number;
  new_bottles_count: number;
  arrived_at: string;
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
