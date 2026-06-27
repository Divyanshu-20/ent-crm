import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Gender = "male" | "female" | "other";

export type Patient = Tables<"patients">;
export type PatientInsert = TablesInsert<"patients">;
export type PatientUpdate = TablesUpdate<"patients">;

export function fullName(p: Pick<Patient, "first_name" | "last_name">) {
  return `${p.first_name} ${p.last_name}`.trim();
}
