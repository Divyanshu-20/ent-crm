import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({ meta: [{ title: "Settings — ENT Clinic CRM" }] }),
  component: () => (
    <div>
      <PageHeader title="Settings" description="Clinic and account preferences." />
      <EmptyState icon={SettingsIcon} title="Coming soon" description="Settings will be available in a later phase." />
    </div>
  ),
});
