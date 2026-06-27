import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { LoadingState } from "@/components/common/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PatientForm,
  normalizePatientForm,
  type PatientFormValues,
} from "@/modules/patients/PatientForm";
import { patientsQueries, updatePatient } from "@/modules/patients/queries";

export const Route = createFileRoute("/_shell/patients/$patientId/edit")({
  head: () => ({ meta: [{ title: "Edit Patient — ENT Clinic CRM" }] }),
  component: EditPatientPage,
});

function EditPatientPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patient, isLoading, isError, error } = useQuery(
    patientsQueries.detail(patientId),
  );

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      updatePatient(patientId, normalizePatientForm(values)),
    onSuccess: () => {
      toast.success("Patient updated");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate({ to: "/patients/$patientId", params: { patientId } });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update patient"),
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit patient" description="Update patient details." />
      <SectionCard title="Patient details">
        {isLoading ? (
          <LoadingState rows={4} />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Couldn't load patient</AlertTitle>
            <AlertDescription>{(error as Error)?.message}</AlertDescription>
          </Alert>
        ) : !patient ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not found</AlertTitle>
            <AlertDescription>This patient no longer exists.</AlertDescription>
          </Alert>
        ) : (
          <PatientForm
            defaultValues={patient}
            submitting={mutation.isPending}
            submitLabel="Save changes"
            onSubmit={(values) => mutation.mutate(values)}
            onCancel={() =>
              navigate({ to: "/patients/$patientId", params: { patientId } })
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
