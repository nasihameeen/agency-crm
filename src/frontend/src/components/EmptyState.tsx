import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  "data-ocid"?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCta,
  className,
  size = "md",
  "data-ocid": ocid,
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      wrapper: "py-8 gap-3",
      iconWrap: "size-12",
      icon: "size-5",
      title: "text-sm font-semibold",
      desc: "text-xs",
      btn: "text-xs px-3 py-1.5",
    },
    md: {
      wrapper: "py-12 gap-4",
      iconWrap: "size-16",
      icon: "size-7",
      title: "text-base font-semibold",
      desc: "text-sm",
      btn: "text-sm px-4 py-2",
    },
    lg: {
      wrapper: "py-16 gap-5",
      iconWrap: "size-20",
      icon: "size-9",
      title: "text-lg font-semibold",
      desc: "text-sm",
      btn: "text-sm px-5 py-2.5",
    },
  }[size];

  return (
    <div
      data-ocid={ocid ?? "empty_state"}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.wrapper,
        className,
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl",
          "bg-muted border border-border",
          sizeConfig.iconWrap,
        )}
      >
        <Icon className={cn("text-muted-foreground", sizeConfig.icon)} />
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-xs">
        <h3 className={cn("text-foreground", sizeConfig.title)}>{title}</h3>
        {description && (
          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              sizeConfig.desc,
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* CTA button */}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          data-ocid="empty_state.cta_button"
          className={cn(
            "gradient-accent text-white font-semibold rounded-full",
            "shadow-glow transition-all duration-250 ease-out",
            "hover:-translate-y-0.5 hover:shadow-glow",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            sizeConfig.btn,
          )}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
