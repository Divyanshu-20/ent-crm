import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  iconBg = "bg-primary/15",
  iconColor = "text-primary",
  trend,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<LucideProps>;
  hint?: string;
  iconBg?: string;
  iconColor?: string;
  trend?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconBg,
            iconColor,
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">{value}</p>
      {(hint || trend) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {trend}
          {hint}
        </p>
      )}
    </div>
  );
}
