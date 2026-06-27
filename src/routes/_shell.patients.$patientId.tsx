import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { patientsQueries, deletePatient } from "@/modules/patients/queries";
import { fullName } from "@/modules/patients/types";

export const Route = createFileRoute("/_shell/patients/$patientId")({
  head: () => ({ meta: [{ title: "Patient — ENT Clinic CRM" }] }),
  component: PatientLayout,
});

const tabs: { to: string; label: string; exact?: boolean }[] = [
  { to: "/patients/$patientId", label: "Overview", exact: true },
  { to: "/patients/$patientId/consultations", label: "Consultations" },
];

function PatientLayout() {
  const { patientId } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const base = `/patients/${patientId}`;

  const { data: patient, isLoading, isError, error } = useQuery(
    patientsQueries.detail(patientId),
  );

  const deleteMutation = useMutation({
    mutationFn: () => deletePatient(patientId),
    onSuccess: () => {
      toast.success("Patient deleted");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate({ to: "/patients" });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete patient"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={2} />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Couldn't load patient</AlertTitle>
        <AlertDescription>{(error as Error)?.message}</AlertDescription>
      </Alert>
    );
  }

  if (!patient) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Patient not found</AlertTitle>
        <AlertDescription>
          The patient you're looking for doesn't exist or was deleted.{" "}
          <Link to="/patients" className="underline">
            Back to patients
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const name = fullName(patient);
  const meta = [
    patient.gender,
    patient.date_of_birth && `DOB ${patient.date_of_birth}`,
    patient.phone,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
        <PatientAvatar name={name} className="h-14 w-14 text-base" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">{meta || "No contact info"}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/patients/$patientId/edit" params={{ patientId }}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Trash2 className="mr-1.5 h-4 w-4 text-destructive" /> Delete
              </Button>
            }
            title={`Delete ${name}?`}
            description="This will permanently remove the patient record. This action cannot be undone."
            confirmLabel="Delete"
            destructive
            onConfirm={() => deleteMutation.mutate()}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b">
        {tabs.map((t) => {
          const href = t.to.replace("$patientId", patientId);
          const active = t.exact ? pathname === base : pathname === href;
          return (
            <Link
              key={t.to}
              to={t.to as "/patients/$patientId"}
              params={{ patientId }}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
