import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ConsultationForm,
  normalizeConsultationForm,
  type ConsultationFormValues,
} from "@/modules/consultations/ConsultationForm";
import { createConsultation } from "@/modules/consultations/queries";

export function QuickAddFab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fabRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [consultDialogOpen, setConsultDialogOpen] = useState(false);

  // Close menu when clicking outside the FAB
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  // Detect if we're viewing a specific patient (but not on the "new" page)
  const patientMatch = pathname.match(/\/patients\/([^/]+)/);
  const currentPatientId =
    patientMatch && patientMatch[1] !== "new" ? patientMatch[1] : null;
  const canAddConsultation = Boolean(currentPatientId);

  const createMut = useMutation({
    mutationFn: (values: ConsultationFormValues) =>
      createConsultation({
        patient_id: currentPatientId!,
        ...normalizeConsultationForm(values),
      }),
    onSuccess: (row) => {
      toast.success("Consultation saved");
      setConsultDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["consultations", "by-patient", currentPatientId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Navigate to consultations tab so the new record is visible
      navigate({
        to: "/patients/$patientId/consultations",
        params: { patientId: currentPatientId! },
      });
      void row;
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save consultation"),
  });

  function openNewConsultation() {
    setMenuOpen(false);
    setConsultDialogOpen(true);
  }

  function openNewPatient() {
    setMenuOpen(false);
    navigate({ to: "/patients/new" });
  }

  return (
    <>
      {/* FAB container */}
      <div ref={fabRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Menu items */}
        <div
          className={cn(
            "flex flex-col items-end gap-2 transition-all duration-200",
            menuOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
          )}
        >
          {/* New Consultation */}
          <div className="flex items-center gap-2">
            <span className="rounded-md border bg-popover px-2.5 py-1 text-sm shadow-md whitespace-nowrap">
              New Consultation
            </span>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full shadow-md"
              disabled={!canAddConsultation}
              onClick={openNewConsultation}
              title={canAddConsultation ? "Add consultation" : "Open a patient to add a consultation"}
            >
              <Stethoscope className="h-4 w-4" />
            </Button>
          </div>

          {/* New Patient */}
          <div className="flex items-center gap-2">
            <span className="rounded-md border bg-popover px-2.5 py-1 text-sm shadow-md whitespace-nowrap">
              New Patient
            </span>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full shadow-md"
              onClick={openNewPatient}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main FAB button */}
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close quick actions" : "Quick actions"}
        >
          <span
            className={cn(
              "transition-transform duration-200",
              menuOpen ? "rotate-45" : "rotate-0",
            )}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </span>
        </Button>
      </div>

      {/* New Consultation Dialog */}
      <Dialog
        open={consultDialogOpen}
        onOpenChange={(o) => {
          setConsultDialogOpen(o);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Consultation</DialogTitle>
            <DialogDescription>Record today's encounter.</DialogDescription>
          </DialogHeader>
          {currentPatientId && (
            <ConsultationForm
              submitting={createMut.isPending}
              submitLabel="Save consultation"
              onSubmit={(values) => createMut.mutate(values)}
              onCancel={() => setConsultDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
