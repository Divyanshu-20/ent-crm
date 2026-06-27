import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;
