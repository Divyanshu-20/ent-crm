import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  Pill,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { FollowUpBadge } from "@/components/common/FollowUpBadge";
import { cn } from "@/lib/utils";
import { consultationsQueries } from "@/modules/consultations/queries";
import type { Consultation } from "@/modules/consultations/types";

export const Route = createFileRoute("/_shell/patients/$patientId/")({
  component: PatientOverview,
});

function PatientOverview() {
  const { patientId } = Route.useParams();
  const { data, isLoading } = useQuery(consultationsQueries.byPatient(patientId));

  if (isLoading) return <LoadingState rows={3} />;

  const consultations = data ?? [];
  const latest: Consultation | undefined = consultations[0];

  if (!latest) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No clinical summary yet"
        description="Record the patient's first consultation — their summary will appear here automatically."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Clinical summary</h2>
            <p className="text-xs text-muted-foreground">
              Auto-derived from the latest consultation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground tabular-nums">
                {consultations.length}
              </span>
              {consultations.length === 1 ? "consultation" : "consultations"}
            </span>
            <FollowUpBadge date={latest.follow_up_date} showDate />
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          <SummaryCell
            icon={CalendarDays}
            label="Last consultation"
            value={formatDate(latest.consultation_date)}
          />
          <SummaryCell
            icon={CalendarDays}
            label="Next follow-up"
            value={latest.follow_up_date ? formatDate(latest.follow_up_date) : null}
          />
          <SummaryCell
            icon={Stethoscope}
            label="Latest diagnosis"
            value={latest.diagnosis}
            multiline
          />
          <SummaryCell
            icon={Syringe}
            label="Immunotherapy status"
            value={latest.immunotherapy_status}
            multiline
          />
          <SummaryCell
            icon={FileText}
            label="Current treatment plan"
            value={latest.treatment_plan}
            multiline
            full
          />
          <SummaryCell
            icon={Pill}
            label="Current medications"
            value={latest.medications}
            multiline
            full
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCell({
  icon: Icon,
  label,
  value,
  multiline,
  full,
}: {
  icon: typeof Activity;
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  full?: boolean;
}) {
  return (
    <div className={cn("bg-card px-4 py-3", full && "sm:col-span-2")}>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-sm",
          multiline && "whitespace-pre-wrap",
          value ? "text-foreground" : "text-muted-foreground italic",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
