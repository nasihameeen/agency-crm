import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardVariant = "default" | "premium" | "glass";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: CardVariant;
}

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  padding = "md",
  variant = "default",
}: CardProps) {
  const paddingClass = { sm: "p-4", md: "p-5", lg: "p-6" }[padding];

  const variantClass: Record<CardVariant, string> = {
    default: "bg-card border border-border shadow-card",
    premium: [
      "bg-card border border-border shadow-card",
      "relative overflow-hidden",
      "before:absolute before:inset-x-0 before:top-0 before:h-[2px]",
      "before:bg-gradient-to-r before:from-transparent before:via-[oklch(0.62_0.20_275)] before:to-transparent",
      "before:opacity-60",
    ].join(" "),
    glass: "glass border-0 shadow-elevated",
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "rounded-xl",
        variantClass[variant],
        paddingClass,
        hoverable && [
          "cursor-pointer",
          "transition-all duration-250 ease-out will-change-transform",
          "hover:-translate-y-1 hover:shadow-elevated",
          variant === "premium" &&
            "hover:shadow-premium hover:before:opacity-90",
        ],
        onClick &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
