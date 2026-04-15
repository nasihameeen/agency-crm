import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border border-border",
  },
  InProgress: {
    label: "In Progress",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  Completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.className}`}
    >
      <span
        className={`size-1.5 rounded-full flex-shrink-0 ${
          status === "Pending"
            ? "bg-muted-foreground"
            : status === "InProgress"
              ? "bg-orange-500"
              : "bg-green-600"
        }`}
      />
      {config.label}
    </span>
  );
}
