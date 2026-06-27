import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Consultation, ConsultationInsert, ConsultationUpdate } from "./types";

export const consultationsQueries = {
  byPatient: (patientId: string) =>
    queryOptions({
      queryKey: ["consultations", "by-patient", patientId] as const,
      queryFn: async (): Promise<Consultation[]> => {
        const { data, error } = await supabase
          .from("consultations")
          .select("*")
          .eq("patient_id", patientId)
          .order("consultation_date", { ascending: false })
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data ?? [];
      },
      enabled: Boolean(patientId),
    }),
};

export async function createConsultation(values: ConsultationInsert): Promise<Consultation> {
  const { data, error } = await supabase
    .from("consultations")
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConsultation(
  id: string,
  values: ConsultationUpdate,
): Promise<Consultation> {
  const { data, error } = await supabase
    .from("consultations")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteConsultation(id: string): Promise<void> {
  const { error } = await supabase.from("consultations").delete().eq("id", id);
  if (error) throw error;
}
