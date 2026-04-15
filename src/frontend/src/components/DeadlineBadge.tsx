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
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  const config =
    deadlineStatus === "Overdue"
      ? {
          label: "Overdue",
          className: "bg-red-100 text-red-700 border border-red-200",
          dotClass: "bg-red-500",
        }
      : {
          label: "Due Soon",
          className: "bg-amber-100 text-amber-700 border border-amber-200",
          dotClass: "bg-amber-500",
        };

  return (
    <span
      className={`badge-hover inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.className}`}
    >
      <span
        className={`size-1.5 rounded-full flex-shrink-0 ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}
