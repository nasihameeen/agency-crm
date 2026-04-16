import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { getTaskProgress } from "@/types";

interface TaskProgressBarProps {
  tasks: Task[];
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function TaskProgressBar({
  tasks,
  showLabel = true,
  size = "sm",
  className,
}: TaskProgressBarProps) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No tasks yet</p>;
  }

  const { done, total, percent } = getTaskProgress(tasks);
  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {done}/{total} tasks
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              percent === 100
                ? "text-success"
                : percent > 50
                  ? "text-accent"
                  : "text-muted-foreground",
            )}
          >
            {percent}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${done} of ${total} tasks completed`}
        tabIndex={-1}
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden focus:outline-none",
          barHeight,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            "progress-gradient",
            percent === 100 && "shadow-glow-success",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
