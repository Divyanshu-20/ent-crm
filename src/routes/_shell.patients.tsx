import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/patients")({
  component: () => <Outlet />,
});
