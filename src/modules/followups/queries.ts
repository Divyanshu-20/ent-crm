import { queryOptions } from "@tanstack/react-query";
import type { FollowUp } from "./types";

export const followupsQueries = {
  upcoming: () =>
    queryOptions({
      queryKey: ["followups", "upcoming"] as const,
      queryFn: async (): Promise<FollowUp[]> => [],
    }),
  byPatient: (patientId: string) =>
    queryOptions({
      queryKey: ["followups", "patient", patientId] as const,
      queryFn: async (): Promise<FollowUp[]> => [],
    }),
};
