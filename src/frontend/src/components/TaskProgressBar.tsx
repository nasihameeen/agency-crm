import type { Task } from "@/types";
import { getTaskProgress } from "@/types";

interface TaskProgressBarProps {
  tasks: Task[];
  showLabel?: boolean;
}

export function TaskProgressBar({
  tasks,
  showLabel = true,
}: TaskProgressBarProps) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-xs text-muted-foreground">No tasks yet</p>;
  }

  const { done, total, percent } = getTaskProgress(tasks);

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {done}/{total} tasks completed
        </span>
      )}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
