export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  severity: "mild" | "moderate" | "severe" | null;
  notes: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Immunotherapy {
  id: string;
  patient_id: string;
  protocol: string;
  start_date: string | null;
  current_dose: string | null;
  status: "active" | "paused" | "completed" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
