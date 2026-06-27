import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Settings, Activity, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { dashboardQueries } from "@/modules/dashboard/queries";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);
  const { data: stats } = useQuery(dashboardQueries.stats());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || email.substring(0, 2).toUpperCase()
    : "DD";

  const displayName = email
    ? `Dr. ${email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
    : "Dr. Dangore";

  const activeClass =
    "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium";

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow">
            <Activity className="h-[18px] w-[18px]" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight text-sidebar-foreground">
              ENT Clinic
            </span>
            <span className="text-[11px] text-sidebar-foreground/55">Patient CRM</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Main nav */}
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                  className={activeClass}
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/patients")}
                  tooltip="Patients"
                  className={activeClass}
                >
                  <Link to="/patients">
                    <Users className="h-4 w-4" />
                    <span>Patients</span>
                  </Link>
                </SidebarMenuButton>
                {stats?.totalPatients !== undefined && stats.totalPatients > 0 && (
                  <SidebarMenuBadge className="rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                    {stats.totalPatients}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom of nav area */}
        <SidebarGroup className="mt-auto pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings")}
                  tooltip="Settings"
                  className={activeClass}
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Doctor profile footer */}
      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <div className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs font-semibold text-sidebar-foreground">
              {displayName}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/55">ENT Specialist</span>
          </div>
          <button
            type="button"
            className="shrink-0 rounded p-1 text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
