import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Filter, Pencil, Plus, Search, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { patientsQueries, deletePatient } from "@/modules/patients/queries";
import { fullName } from "@/modules/patients/types";

export const Route = createFileRoute("/_shell/patients/")({
  head: () => ({
    meta: [
      { title: "Patients — ENT Clinic CRM" },
      { name: "description", content: "All patient records." },
    ],
  }),
  component: PatientsList,
});

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function PatientsList() {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 250);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching, refetch } = useQuery(
    patientsQueries.list(debounced),
  );

  // Latest consultation date per patient for "Last Visit" column
  const { data: lastVisitMap } = useQuery({
    queryKey: ["consultations", "last-per-patient"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("consultations")
        .select("patient_id, consultation_date")
        .order("consultation_date", { ascending: false });
      if (error) throw error;
      const map = new Map<string, string>();
      for (const c of rows ?? []) {
        if (!map.has(c.patient_id)) map.set(c.patient_id, c.consultation_date);
      }
      return map;
    },
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      toast.success("Patient deleted");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["consultations", "last-per-patient"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete patient"),
  });

  const totalCount = data?.length ?? 0;
  const subtitleCount = debounced
    ? `${totalCount} result${totalCount !== 1 ? "s" : ""} for "${debounced}"`
    : `${totalCount} record${totalCount !== 1 ? "s" : ""} · Search, view & manage`;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isLoading ? "Loading…" : subtitleCount}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link to="/patients/new">
            <Plus className="h-4 w-4" />
            New patient
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full min-w-40 rounded-lg border bg-card pl-9 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Search patients"
          />
          {isFetching && !isLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              …
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-card"
          onClick={() => toast.info("Filter coming soon")}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-card"
          onClick={() => toast.info("Export coming soon")}
        >
          <Upload className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border bg-card p-4">
          <LoadingState rows={5} />
        </div>
      ) : isError ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-destructive">Failed to load patients.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-card p-8">
          {debounced ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description={`No patients match "${debounced}".`}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No patients yet"
              description="Add your first patient to start tracking consultations and follow-ups."
              action={
                <Button asChild>
                  <Link to="/patients/new">
                    <Plus className="mr-1.5 h-4 w-4" /> Add patient
                  </Link>
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  DOB
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last Visit
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => {
                const lastVisit = lastVisitMap?.get(p.id) ?? null;
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer border-border/50 hover:bg-muted/30"
                    onClick={() =>
                      navigate({
                        to: "/patients/$patientId",
                        params: { patientId: p.id },
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={fullName(p)} className="h-8 w-8 shrink-0 text-xs" />
                        <span className="font-semibold text-foreground">{fullName(p)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.phone ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[140px] text-sm text-muted-foreground">
                      <span className="block truncate">{p.email ?? "—"}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.date_of_birth ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lastVisit ? formatDate(lastVisit) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success">
                        Active
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="View patient"
                        >
                          <Link to="/patients/$patientId" params={{ patientId: p.id }}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="Edit patient"
                        >
                          <Link to="/patients/$patientId/edit" params={{ patientId: p.id }}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              aria-label="Delete patient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title={`Delete ${fullName(p)}?`}
                          description="This will permanently remove the patient record. This action cannot be undone."
                          confirmLabel="Delete"
                          destructive
                          onConfirm={() => deleteMutation.mutate(p.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
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
