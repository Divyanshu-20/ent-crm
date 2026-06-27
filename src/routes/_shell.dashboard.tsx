import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarClock,
  CalendarCheck,
  ChevronRight,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardQueries } from "@/modules/dashboard/queries";
import { fullName } from "@/modules/patients/types";
import { getFollowUpStatus } from "@/modules/consultations/followup";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ENT Clinic CRM" },
      { name: "description", content: "Today's clinic overview." },
    ],
  }),
  component: DashboardPage,
});

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function todayLabel() {
  const d = new Date();
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ENT Clinic`;
}

const FOLLOW_UP_COLORS: Record<string, string> = {
  overdue: "text-destructive",
  today: "text-success",
  upcoming: "text-warning",
  none: "text-muted-foreground",
};

const FOLLOW_UP_LABELS: Record<string, string> = {
  overdue: "OVERDUE",
  today: "TODAY",
  upcoming: "UPCOMING",
  none: "—",
};

function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery(dashboardQueries.stats());
  const { data: recentPatients, isLoading: patientsLoading } = useQuery(
    dashboardQueries.recentPatients(),
  );
  const { data: recentConsultations, isLoading: consultationsLoading } = useQuery(
    dashboardQueries.recentConsultations(),
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{todayLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/patients/new">
              <UserPlus className="h-4 w-4" />
              New patient
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/patients">
              <Plus className="h-4 w-4" />
              New consultation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Patients"
              value={stats?.totalPatients ?? 0}
              icon={Users}
              iconBg="bg-primary/15"
              iconColor="text-primary"
              hint="All records active"
              trend={<TrendingUp className="h-3 w-3 text-success" />}
            />
            <StatCard
              label="Consultations"
              value={stats?.totalConsultations ?? 0}
              icon={Activity}
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
              hint="Across all patients"
            />
            <StatCard
              label="Today"
              value={stats?.consultationsToday ?? 0}
              icon={CalendarCheck}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              hint="Consultations today"
            />
            <StatCard
              label="Follow-ups (7D)"
              value={stats?.upcomingFollowUps ?? 0}
              icon={CalendarClock}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
              hint={stats?.upcomingFollowUps === 0 ? "None scheduled" : "Due in next 7 days"}
            />
          </>
        )}
      </div>

      {/* Recent sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Patients */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex items-start justify-between px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Patients</h2>
              <p className="text-xs text-muted-foreground">Last 10 updated records</p>
            </div>
            <Link
              to="/patients"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-3 pb-3">
            {patientsLoading ? (
              <LoadingState rows={4} />
            ) : !recentPatients || recentPatients.length === 0 ? (
              <div className="py-4">
                <EmptyState
                  icon={Users}
                  title="No patients yet"
                  description="Patient records will appear here once added."
                />
              </div>
            ) : (
              <ul>
                {recentPatients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                      onClick={() =>
                        navigate({ to: "/patients/$patientId", params: { patientId: p.id } })
                      }
                    >
                      <PatientAvatar
                        name={fullName(p)}
                        className="h-9 w-9 shrink-0 text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {fullName(p)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.phone ?? p.email ?? "No contact info"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {formatShort(p.updated_at)}
                        </span>
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                          Active
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex items-start justify-between px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Consultations</h2>
              <p className="text-xs text-muted-foreground">Last 10 across all patients</p>
            </div>
            <Link
              to="/patients"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-3 pb-3">
            {consultationsLoading ? (
              <LoadingState rows={4} />
            ) : !recentConsultations || recentConsultations.length === 0 ? (
              <div className="py-4">
                <EmptyState
                  icon={Activity}
                  title="No consultations yet"
                  description="Consultations will appear here once recorded."
                />
              </div>
            ) : (
              <ul>
                {recentConsultations.map((c) => {
                  const patient = c.patients;
                  const name = patient
                    ? `${patient.first_name} ${patient.last_name}`.trim()
                    : "Unknown";
                  const status = getFollowUpStatus(c.follow_up_date);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                        onClick={() =>
                          navigate({
                            to: "/patients/$patientId",
                            params: { patientId: c.patient_id },
                          })
                        }
                      >
                        <PatientAvatar name={name} className="h-9 w-9 shrink-0 text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.diagnosis ?? c.chief_complaint ?? "No diagnosis recorded"}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {formatDate(c.consultation_date)}
                          </span>
                          {c.follow_up_date && status !== "none" && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wide ${FOLLOW_UP_COLORS[status]}`}
                            >
                              {FOLLOW_UP_LABELS[status]}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatShort(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
