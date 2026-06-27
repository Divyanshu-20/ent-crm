import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import {
  consultationsQueries,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "@/modules/consultations/queries";
import {
  ConsultationForm,
  normalizeConsultationForm,
  type ConsultationFormValues,
} from "@/modules/consultations/ConsultationForm";
import type { Consultation } from "@/modules/consultations/types";
import { FollowUpBadge } from "@/components/common/FollowUpBadge";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_shell/patients/$patientId/consultations")({
  component: ConsultationsTab,
});

function ConsultationsTab() {
  const { patientId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery(
    consultationsQueries.byPatient(patientId),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Consultation | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["consultations", "by-patient", patientId] });

  const createMut = useMutation({
    mutationFn: (values: ConsultationFormValues) =>
      createConsultation({ patient_id: patientId, ...normalizeConsultationForm(values) }),
    onSuccess: (row) => {
      toast.success("Consultation saved");
      setDialogOpen(false);
      setExpanded((prev) => new Set(prev).add(row.id));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ConsultationFormValues }) =>
      updateConsultation(id, normalizeConsultationForm(values)),
    onSuccess: () => {
      toast.success("Consultation updated");
      setDialogOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteConsultation(id),
    onSuccess: () => {
      toast.success("Consultation deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(c: Consultation) {
    setEditing(c);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Consultations</h2>
          <p className="text-sm text-muted-foreground">
            Encounter history in reverse chronological order.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> New consultation
        </Button>
      </div>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn't load consultations</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(error as Error)?.message}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No consultations yet"
          description="Record the patient's first encounter to build their history."
          action={
            <Button onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" /> New consultation
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {data.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              expanded={expanded.has(c.id)}
              onToggle={() => toggle(c.id)}
              onEdit={() => openEdit(c)}
              onDelete={() => deleteMut.mutate(c.id)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit consultation" : "New consultation"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this encounter's clinical details."
                : "Record today's encounter."}
            </DialogDescription>
          </DialogHeader>
          <ConsultationForm
            defaultValues={editing ?? undefined}
            submitting={createMut.isPending || updateMut.isPending}
            submitLabel={editing ? "Save changes" : "Save consultation"}
            onSubmit={(values) =>
              editing
                ? updateMut.mutate({ id: editing.id, values })
                : createMut.mutate(values)
            }
            onCancel={() => {
              setDialogOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConsultationCard({
  consultation,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  consultation: Consultation;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const c = consultation;

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium tabular-nums">
              {formatDate(c.consultation_date)}
            </span>
            <span className="truncate text-sm font-medium text-foreground">
              {c.diagnosis || <span className="text-muted-foreground italic">No diagnosis</span>}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <FollowUpBadge date={c.follow_up_date} showDate />
            {c.immunotherapy_status && (
              <Badge variant="secondary" className="font-normal">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mr-1.5" />
                Immunotherapy
              </Badge>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          <Field label="Chief complaint" value={c.chief_complaint} />
          <Field label="Examination findings" value={c.examination_findings} />
          <Field label="Diagnosis" value={c.diagnosis} />
          <Field label="Treatment plan" value={c.treatment_plan} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Medications" value={c.medications} />
            <Field label="Immunotherapy status" value={c.immunotherapy_status} />
          </div>
          <Field label="Clinical notes" value={c.clinical_notes} />

          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5 text-destructive" /> Delete
                </Button>
              }
              title="Delete consultation?"
              description="This will permanently remove this encounter. This action cannot be undone."
              confirmLabel="Delete"
              destructive
              onConfirm={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 whitespace-pre-wrap text-sm",
          value ? "text-foreground" : "text-muted-foreground italic",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  // iso is YYYY-MM-DD; render as locale date without TZ shifts
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
