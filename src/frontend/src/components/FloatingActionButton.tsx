import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  "data-ocid"?: string;
}

export function FloatingActionButton({
  onClick,
  label,
  className,
  "data-ocid": ocid,
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid ?? "fab.add_button"}
      aria-label={label ?? "Add new item"}
      className={cn(
        // Position & size
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2",
        // Gradient background
        "gradient-accent text-white",
        // Shape — pill when label present, circle otherwise
        label ? "h-12 pl-4 pr-5 rounded-full" : "size-14 rounded-full",
        // Shadow + glow
        "shadow-glow",
        // Transitions
        "transition-all duration-250 ease-out will-change-transform",
        "hover:-translate-y-1 hover:shadow-premium",
        "active:scale-[0.96] active:shadow-elevated",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        className,
      )}
    >
      <Plus
        className={cn(
          "flex-shrink-0 transition-transform duration-250",
          "group-hover:rotate-90",
          label ? "size-4" : "size-5",
        )}
      />
      {label && (
        <span className="text-sm font-semibold font-body tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
}
