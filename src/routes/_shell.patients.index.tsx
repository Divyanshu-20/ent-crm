import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Search, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useStateDebounce(value, setV, delay);
  return v;
}

// tiny inline helper to avoid an extra file
import { useEffect } from "react";
function useStateDebounce<T>(value: T, setter: (v: T) => void, delay: number) {
  useEffect(() => {
    const id = setTimeout(() => setter(value), delay);
    return () => clearTimeout(id);
  }, [value, delay, setter]);
}

function PatientsList() {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 250);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    patientsQueries.list(debounced),
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      toast.success("Patient deleted");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete patient"),
  });

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Search, view, and manage patient records."
        actions={
          <Button asChild>
            <Link to="/patients/new">
              <Plus className="mr-1.5 h-4 w-4" /> New patient
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>

      {isLoading ? (
        <LoadingState rows={5} />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn't load patients</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(error as Error)?.message ?? "Unknown error"}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data || data.length === 0 ? (
        debounced ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No patients match "${debounced}".`}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No patients yet"
            description="Add your first patient to start tracking visits, surgeries, and follow-ups."
            action={
              <Button asChild>
                <Link to="/patients/new">
                  <Plus className="mr-1.5 h-4 w-4" /> Add patient
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/patients/$patientId",
                      params: { patientId: p.id },
                    })
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={fullName(p)} className="h-8 w-8 text-xs" />
                      <span className="font-medium">{fullName(p)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.date_of_birth ?? "—"}
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
                        aria-label="Edit patient"
                      >
                        <Link
                          to="/patients/$patientId/edit"
                          params={{ patientId: p.id }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Delete patient">
                            <Trash2 className="h-4 w-4 text-destructive" />
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
