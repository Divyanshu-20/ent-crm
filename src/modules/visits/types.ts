export interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
}
