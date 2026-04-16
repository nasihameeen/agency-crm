import type { PaymentStatus } from "@/types";

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
}

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; dotClass: string }
> = {
  Paid: {
    label: "Paid",
    className:
      "bg-success/10 text-success border border-success/25 hover:bg-success/15",
    dotClass: "bg-success",
  },
  Partial: {
    label: "Partial",
    className:
      "bg-warning/10 text-warning-foreground border border-warning/25 hover:bg-warning/15",
    dotClass: "bg-warning",
  },
  Unpaid: {
    label: "Unpaid",
    className:
      "bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/15",
    dotClass: "bg-destructive",
  },
};

export function PaymentBadge({ status, size = "md" }: PaymentBadgeProps) {
  const config = PAYMENT_CONFIG[status];
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
