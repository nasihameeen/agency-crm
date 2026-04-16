import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string; dotClass: string }
> = {
  Pending: {
    label: "Pending",
    className:
      "bg-muted/80 text-muted-foreground border border-border/80 hover:bg-muted",
    dotClass: "bg-muted-foreground",
  },
  InProgress: {
    label: "In Progress",
    className:
      "bg-warning/10 text-warning-foreground border border-warning/25 hover:bg-warning/15",
    dotClass: "bg-warning",
  },
  Completed: {
    label: "Completed",
    className:
      "bg-success/10 text-success border border-success/25 hover:bg-success/15",
    dotClass: "bg-success",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5";

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
