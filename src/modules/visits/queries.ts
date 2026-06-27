import { queryOptions } from "@tanstack/react-query";
import type { Visit } from "./types";

export const visitsQueries = {
  byPatient: (patientId: string) =>
    queryOptions({
      queryKey: ["visits", "patient", patientId] as const,
      queryFn: async (): Promise<Visit[]> => [],
    }),
  recent: () =>
    queryOptions({
      queryKey: ["visits", "recent"] as const,
      queryFn: async (): Promise<Visit[]> => [],
    }),
};
