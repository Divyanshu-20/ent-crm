import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function PatientAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
