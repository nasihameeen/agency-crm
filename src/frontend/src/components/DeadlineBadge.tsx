import type { ProjectStatus } from "@/types";
import { getDeadlineStatus } from "@/types";

interface DeadlineBadgeProps {
  deadline: string | undefined;
  status: ProjectStatus;
  size?: "sm" | "md";
}

export function DeadlineBadge({
  deadline,
  status,
  size = "md",
}: DeadlineBadgeProps) {
  if (status === "Completed") return null;

  const deadlineStatus = getDeadlineStatus(deadline);

  if (deadlineStatus === "Normal") return null;

  const sizeClass =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5";

  const config =
    deadlineStatus === "Overdue"
      ? {
          label: "Overdue",
          className:
            "bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/15",
          dotClass: "bg-destructive",
        }
      : {
          label: "Due Soon",
          className:
            "bg-warning/10 text-warning-foreground border border-warning/25 hover:bg-warning/15",
          dotClass: "bg-warning",
        };

  return (
    <span
      className={`badge-hover inline-flex items-center rounded-full font-medium transition-all duration-150 ${sizeClass} ${config.className}`}
    >
      <span
        className={`size-1.5 rounded-full flex-shrink-0 ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}
