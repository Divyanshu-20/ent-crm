export interface FollowUp {
  id: string;
  patient_id: string;
  scheduled_date: string;
  reason: string | null;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  notes: string | null;
  created_at: string;
}
