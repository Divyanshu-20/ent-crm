export interface Surgery {
  id: string;
  patient_id: string;
  surgery_date: string;
  procedure: string;
  surgeon: string | null;
  outcome: string | null;
  notes: string | null;
  created_at: string;
}
