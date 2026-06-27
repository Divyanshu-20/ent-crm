import { createFileRoute } from "@tanstack/react-router";
import { Users, Stethoscope, CalendarClock, Scissors } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ENT Clinic CRM" },
      { name: "description", content: "Today's clinic overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of today's clinic activity."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Patients" value="—" icon={Users} />
        <StatCard label="Visits Today" value="—" icon={Stethoscope} />
        <StatCard label="Upcoming Follow-ups" value="—" icon={CalendarClock} />
        <StatCard label="Surgeries This Month" value="—" icon={Scissors} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent Patients" description="Most recently seen patients.">
          <EmptyState
            icon={Users}
            title="No patients yet"
            description="Patient records will appear here once added."
          />
        </SectionCard>
        <SectionCard title="Upcoming Follow-ups" description="Scheduled visits ahead.">
          <EmptyState
            icon={CalendarClock}
            title="No follow-ups scheduled"
            description="Scheduled follow-ups will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}
