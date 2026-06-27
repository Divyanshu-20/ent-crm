import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { supabase } from "@/integrations/supabase/client";
import { patientsQueries } from "@/modules/patients/queries";
import { fullName } from "@/modules/patients/types";

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const debouncedSearch = useDebounced(searchText, 200);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const { data: results, isFetching } = useQuery({
    ...patientsQueries.list(debouncedSearch),
    enabled: debouncedSearch.trim().length > 0,
  });

  const showDropdown = dropdownVisible && debouncedSearch.trim().length > 0;

  function selectPatient(id: string) {
    navigate({ to: "/patients/$patientId", params: { patientId: id } });
    setSearchText("");
    setDropdownVisible(false);
  }

  function clearSearch() {
    setSearchText("");
    setDropdownVisible(false);
    inputRef.current?.focus();
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || email.substring(0, 2).toUpperCase()
    : "DD";

  return (
    <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b bg-card px-4">
      {/* Mobile sidebar trigger */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground md:hidden" />

      {/* Global search */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search patients..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setDropdownVisible(true);
          }}
          onFocus={() => {
            if (searchText.trim()) setDropdownVisible(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") clearSearch();
          }}
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Search patients"
          autoComplete="off"
        />
        {searchText && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Results dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border bg-card shadow-elevated">
            {isFetching && (!results || results.length === 0) ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
            ) : !results || results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No patients match &ldquo;{debouncedSearch}&rdquo;
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-1">
                {results.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        selectPatient(p.id);
                      }}
                    >
                      <PatientAvatar name={fullName(p)} className="h-7 w-7 shrink-0 text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{fullName(p)}</p>
                        {p.phone && (
                          <p className="truncate text-xs text-muted-foreground">{p.phone}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-1 ring-card" />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-xs text-muted-foreground">Signed in as</div>
              <div className="truncate text-sm font-medium">{email ?? "—"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
