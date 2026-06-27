import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/modules/patients/types";
import type { Consultation } from "@/modules/consultations/types";

export type RecentConsultation = Consultation & {
  patients: Pick<Patient, "first_name" | "last_name"> | null;
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function inDaysISO(n: number) {
  return new Date(Date.now() + n * 86_400_000).toISOString().split("T")[0];
}

export const dashboardQueries = {
  stats: () =>
    queryOptions({
      queryKey: ["dashboard", "stats"] as const,
      queryFn: async () => {
        const today = todayISO();
        const in7 = inDaysISO(7);

        const [patients, consultations, todayCount, followUps] = await Promise.all([
          supabase.from("patients").select("*", { count: "exact", head: true }),
          supabase.from("consultations").select("*", { count: "exact", head: true }),
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .eq("consultation_date", today),
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .gte("follow_up_date", today)
            .lte("follow_up_date", in7),
        ]);

        return {
          totalPatients: patients.count ?? 0,
          totalConsultations: consultations.count ?? 0,
          consultationsToday: todayCount.count ?? 0,
          upcomingFollowUps: followUps.count ?? 0,
        };
      },
      staleTime: 30_000,
    }),

  recentPatients: () =>
    queryOptions({
      queryKey: ["dashboard", "recent-patients"] as const,
      queryFn: async (): Promise<Patient[]> => {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        return data ?? [];
      },
      staleTime: 30_000,
    }),

  recentConsultations: () =>
    queryOptions({
      queryKey: ["dashboard", "recent-consultations"] as const,
      queryFn: async (): Promise<RecentConsultation[]> => {
        const { data, error } = await supabase
          .from("consultations")
          .select("*, patients!inner(first_name, last_name)")
          .order("consultation_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        return (data ?? []) as RecentConsultation[];
      },
      staleTime: 30_000,
    }),
};
