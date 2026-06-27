export type FollowUpStatus = "overdue" | "today" | "upcoming" | "none";

export function getFollowUpStatus(followUpDate: string | null | undefined): FollowUpStatus {
  if (!followUpDate) return "none";
  const [y, m, d] = followUpDate.split("-").map(Number);
  if (!y || !m || !d) return "none";
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

export const followUpMeta: Record<
  FollowUpStatus,
  { label: string; dot: string; className: string }
> = {
  today: {
    label: "Due today",
    dot: "bg-success",
    className: "bg-success/15 text-success-foreground border-success/30",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-warning",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-destructive",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  none: {
    label: "No follow-up",
    dot: "bg-muted-foreground",
    className: "bg-muted text-muted-foreground border-border",
  },
};
