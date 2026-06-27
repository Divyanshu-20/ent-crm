import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Consultation } from "./types";
import { consultationTemplates } from "./templates";

const consultationSchema = z.object({
  consultation_date: z.string().min(1, "Required"),
  chief_complaint: z.string().trim().max(2000).optional().or(z.literal("")),
  examination_findings: z.string().trim().max(4000).optional().or(z.literal("")),
  diagnosis: z.string().trim().max(2000).optional().or(z.literal("")),
  treatment_plan: z.string().trim().max(4000).optional().or(z.literal("")),
  medications: z.string().trim().max(4000).optional().or(z.literal("")),
  immunotherapy_status: z.string().trim().max(500).optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
  clinical_notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;

function emptyToNull(v: string | undefined | null) {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
}

export function normalizeConsultationForm(values: ConsultationFormValues) {
  return {
    consultation_date: values.consultation_date,
    chief_complaint: emptyToNull(values.chief_complaint),
    examination_findings: emptyToNull(values.examination_findings),
    diagnosis: emptyToNull(values.diagnosis),
    treatment_plan: emptyToNull(values.treatment_plan),
    medications: emptyToNull(values.medications),
    immunotherapy_status: emptyToNull(values.immunotherapy_status),
    follow_up_date: emptyToNull(values.follow_up_date),
    clinical_notes: emptyToNull(values.clinical_notes),
  };
}

export function ConsultationForm({
  defaultValues,
  submitting,
  submitLabel = "Save consultation",
  onSubmit,
  onCancel,
  showTemplates = true,
}: {
  defaultValues?: Partial<Consultation>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ConsultationFormValues) => void;
  onCancel?: () => void;
  showTemplates?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultation_date: defaultValues?.consultation_date ?? today,
      chief_complaint: defaultValues?.chief_complaint ?? "",
      examination_findings: defaultValues?.examination_findings ?? "",
      diagnosis: defaultValues?.diagnosis ?? "",
      treatment_plan: defaultValues?.treatment_plan ?? "",
      medications: defaultValues?.medications ?? "",
      immunotherapy_status: defaultValues?.immunotherapy_status ?? "",
      follow_up_date: defaultValues?.follow_up_date ?? "",
      clinical_notes: defaultValues?.clinical_notes ?? "",
    },
  });

  const chiefRef = useRef<HTMLTextAreaElement | null>(null);

  // Autofocus chief complaint on mount
  useEffect(() => {
    const t = setTimeout(() => chiefRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Ctrl/Cmd + Enter submits
  const formEl = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formEl.current?.requestSubmit();
      }
    }
    const el = formEl.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
  }, []);

  function applyTemplate(id: string) {
    const t = consultationTemplates.find((x) => x.id === id);
    if (!t) return;
    form.setValue("chief_complaint", t.chief_complaint, { shouldDirty: true });
    form.setValue("examination_findings", t.examination_findings, { shouldDirty: true });
    form.setValue("diagnosis", t.diagnosis, { shouldDirty: true });
    form.setValue("treatment_plan", t.treatment_plan, { shouldDirty: true });
  }

  return (
    <Form {...form}>
      <form
        ref={formEl}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {showTemplates && (
          <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 p-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              Quick template
            </span>
            <Select onValueChange={applyTemplate}>
              <SelectTrigger className="h-8 flex-1 bg-background">
                <SelectValue placeholder="Choose a common ENT presentation…" />
              </SelectTrigger>
              <SelectContent>
                {consultationTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="consultation_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="follow_up_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chief_complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief complaint</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Why is the patient here today?"
                  {...field}
                  ref={(el) => {
                    field.ref(el);
                    chiefRef.current = el;
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="examination_findings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Examination findings</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="treatment_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment plan</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medications</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="One per line, dose & frequency" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="immunotherapy_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Immunotherapy status</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="e.g. SCIT week 12, maintenance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="clinical_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinical notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Tip: press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘/Ctrl + Enter</kbd> to save
          </span>
          <div className="flex gap-2 ml-auto">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
