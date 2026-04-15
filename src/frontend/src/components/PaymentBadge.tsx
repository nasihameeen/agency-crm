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
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  Partial: {
    label: "Partial",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
    dotClass: "bg-orange-500",
  },
  Unpaid: {
    label: "Unpaid",
    className: "bg-red-100 text-red-700 border border-red-200",
    dotClass: "bg-red-500",
  },
};

export function PaymentBadge({ status, size = "md" }: PaymentBadgeProps) {
  const config = PAYMENT_CONFIG[status];
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

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
