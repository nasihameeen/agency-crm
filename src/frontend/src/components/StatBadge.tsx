import { cn } from "@/lib/utils";

type StatBadgeVariant =
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "purple"
  | "neutral";

interface StatBadgeProps {
  label: string;
  variant?: StatBadgeVariant;
  className?: string;
  /** Show a leading dot indicator */
  dot?: boolean;
}

const VARIANT_CLASS: Record<StatBadgeVariant, string> = {
  green: "bg-success/10 text-success border border-success/25",
  red: "bg-destructive/10 text-destructive border border-destructive/25",
  yellow: "bg-warning/10 text-warning-foreground border border-warning/25",
  blue: "bg-accent/10 text-accent border border-accent/25",
  purple: "bg-primary/10 text-primary border border-primary/25",
  neutral: "bg-muted text-muted-foreground border border-border",
};

const DOT_CLASS: Record<StatBadgeVariant, string> = {
  green: "bg-success",
  red: "bg-destructive",
  yellow: "bg-warning",
  blue: "bg-accent",
  purple: "bg-primary",
  neutral: "bg-muted-foreground",
};

export function StatBadge({
  label,
  variant = "neutral",
  className,
  dot = false,
}: StatBadgeProps) {
  return (
    <span
      className={cn(
        "badge-hover inline-flex items-center gap-1.5",
        "text-[11px] font-semibold px-2 py-0.5 rounded-full",
        "transition-all duration-150",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full flex-shrink-0",
            DOT_CLASS[variant],
          )}
        />
      )}
      {label}
    </span>
  );
}
