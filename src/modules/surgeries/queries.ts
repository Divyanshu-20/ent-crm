import { queryOptions } from "@tanstack/react-query";
import type { Surgery } from "./types";

export const surgeriesQueries = {
  byPatient: (patientId: string) =>
    queryOptions({
      queryKey: ["surgeries", "patient", patientId] as const,
      queryFn: async (): Promise<Surgery[]> => [],
    }),
  list: () =>
    queryOptions({
      queryKey: ["surgeries", "list"] as const,
      queryFn: async (): Promise<Surgery[]> => [],
    }),
};
