import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import {
  PatientForm,
  normalizePatientForm,
  type PatientFormValues,
} from "@/modules/patients/PatientForm";
import { createPatient } from "@/modules/patients/queries";

export const Route = createFileRoute("/_shell/patients/new")({
  head: () => ({ meta: [{ title: "New Patient — ENT Clinic CRM" }] }),
  component: NewPatientPage,
});

function NewPatientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) => createPatient(normalizePatientForm(values)),
    onSuccess: (patient) => {
      toast.success("Patient created");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate({ to: "/patients/$patientId", params: { patientId: patient.id } });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create patient"),
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="New patient" description="Create a new patient record." />
      <SectionCard title="Patient details">
        <PatientForm
          submitting={mutation.isPending}
          submitLabel="Create patient"
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={() => navigate({ to: "/patients" })}
        />
      </SectionCard>
    </div>
  );
}
