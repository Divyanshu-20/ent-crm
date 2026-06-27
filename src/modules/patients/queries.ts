import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient, PatientInsert, PatientUpdate } from "./types";

export const patientsQueries = {
  all: () => ["patients"] as const,
  list: (search?: string) =>
    queryOptions({
      queryKey: ["patients", "list", search ?? ""] as const,
      queryFn: async (): Promise<Patient[]> => {
        let query = supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false });

        const q = search?.trim();
        if (q) {
          // escape % and , for ilike / or filter
          const safe = q.replace(/[%,]/g, " ");
          query = query.or(
            `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,phone.ilike.%${safe}%`,
          );
        }
        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      },
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["patients", "detail", id] as const,
      queryFn: async (): Promise<Patient | null> => {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      enabled: Boolean(id),
    }),
};

export async function createPatient(values: PatientInsert): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, values: PatientUpdate): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}
