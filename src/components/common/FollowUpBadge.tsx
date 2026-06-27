import { cn } from "@/lib/utils";
import { getFollowUpStatus, followUpMeta } from "@/modules/consultations/followup";

export function FollowUpBadge({
  date,
  className,
  showDate,
}: {
  date: string | null | undefined;
  className?: string;
  showDate?: boolean;
}) {
  const status = getFollowUpStatus(date);
  const meta = followUpMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
      {showDate && date && status !== "none" && (
        <span className="ml-0.5 text-[10px] opacity-80 tabular-nums">
          {formatShort(date)}
        </span>
      )}
    </span>
  );
}

function formatShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
