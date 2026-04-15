import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  padding = "md",
}: CardProps) {
  const paddingClass = { sm: "p-4", md: "p-5", lg: "p-6" }[padding];

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
        "bg-card rounded-lg border border-border shadow-card",
        paddingClass,
        hoverable &&
          "cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-smooth",
        className,
      )}
    >
      {children}
    </div>
  );
}
