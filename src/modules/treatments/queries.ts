import { queryOptions } from "@tanstack/react-query";
import type { Allergy, Medication, Immunotherapy } from "./types";

export const treatmentsQueries = {
  allergies: (patientId: string) =>
    queryOptions({
      queryKey: ["allergies", "patient", patientId] as const,
      queryFn: async (): Promise<Allergy[]> => [],
    }),
  medications: (patientId: string) =>
    queryOptions({
      queryKey: ["medications", "patient", patientId] as const,
      queryFn: async (): Promise<Medication[]> => [],
    }),
  immunotherapy: (patientId: string) =>
    queryOptions({
      queryKey: ["immunotherapy", "patient", patientId] as const,
      queryFn: async (): Promise<Immunotherapy[]> => [],
    }),
};
