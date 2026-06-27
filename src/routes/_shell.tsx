import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_shell")({
  ssr: false,
  component: ShellLayout,
});

function ShellLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        navigate({ to: "/auth", replace: true });
      } else {
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
