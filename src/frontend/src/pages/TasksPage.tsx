import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useLocalData } from "@/hooks/useLocalData";
import type { Task } from "@/types";
import {
  addDays,
  endOfWeek,
  format,
  isBefore,
  isToday,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  BarChart2,
  CalendarIcon,
  CalendarX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import type { CalendarDay } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "react-day-picker/dist/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatTask = Task & { projectName: string; projectId: string };
type FilterType = "today" | "tomorrow" | "week" | "selected" | "all";

// ─── Priority helpers ─────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-blue-50 text-blue-700 border border-blue-200",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateStr(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function isTaskOverdue(task: FlatTask): boolean {
  if (task.done || !task.date) return false;
  return isBefore(parseISO(task.date), startOfDay(new Date()));
}

// ─── Custom day rendering modifiers ──────────────────────────────────────────

type DotColor = "red" | "yellow" | "green";

function getDotColor(tasks: FlatTask[], dateStr: string): DotColor | null {
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  if (dayTasks.length === 0) return null;
  const today = toDateStr(new Date());
  const hasOverdue = dayTasks.some((t) => !t.done && t.date && t.date < today);
  if (hasOverdue) return "red";
  const hasPending = dayTasks.some((t) => !t.done);
  if (hasPending) return "yellow";
  return "green";
}

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({ pct }: { pct: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const ringColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  const bgTint =
    pct >= 70
      ? "bg-green-50 border-green-200"
      : pct >= 40
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  const textColor =
    pct >= 70
      ? "text-green-700"
      : pct >= 40
        ? "text-amber-700"
        : "text-red-700";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border p-3 shadow-card ${bgTint}`}
    >
      <div className="relative flex items-center justify-center">
        <svg width="72" height="72" className="-rotate-90" aria-hidden="true">
          {/* Track */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-border opacity-40"
          />
          {/* Progress */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        <span
          className={`absolute text-sm font-display font-bold leading-none ${textColor}`}
        >
          {pct}%
        </span>
      </div>
      <p className={`text-xs font-medium mt-1 ${textColor}`}>Done %</p>
    </div>
  );
}

// ─── Stat Card (compact) ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-2 shadow-card">
      <div
        className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-display font-bold text-foreground leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Premium Task Card ────────────────────────────────────────────────────────

function TaskCard({
  task,
  index,
  onToggle,
  onDelete,
}: {
  task: FlatTask;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const overdue = isTaskOverdue(task);
  const priority = task.priority ?? "medium";

  return (
    <div
      data-ocid={`tasks.item.${index}`}
      className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl border bg-card shadow-card hover:shadow-elevated hover:-translate-y-px transition-smooth animate-item-in ${
        task.done
          ? "opacity-60 border-border"
          : overdue
            ? "border-red-200 bg-red-50/30"
            : "border-border hover:border-primary/20"
      }`}
    >
      {/* Custom checkbox */}
      <button
        type="button"
        data-ocid={`tasks.checkbox.${index}`}
        onClick={onToggle}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
        className={`flex-shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          task.done
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 hover:border-primary bg-background"
        }`}
      >
        {task.done && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.done
              ? "line-through text-muted-foreground"
              : overdue
                ? "text-red-700"
                : "text-foreground"
          }`}
        >
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Project badge */}
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
            {task.projectName}
          </span>
          {task.date && (
            <span
              className={`text-[11px] font-medium ${
                overdue
                  ? "text-red-600"
                  : task.done
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {overdue ? "⚠ Overdue · " : ""}
              {format(parseISO(task.date), "MMM d")}
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <span
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${PRIORITY_STYLES[priority]}`}
      >
        {PRIORITY_LABEL[priority]}
      </span>

      {/* Delete — reveals on hover */}
      <button
        type="button"
        data-ocid={`tasks.delete_button.${index}`}
        onClick={onDelete}
        aria-label="Delete task"
        className="flex-shrink-0 size-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Add Task Dialog ──────────────────────────────────────────────────────────

function AddTaskDialog({
  open,
  defaultDate,
  projects,
  onClose,
  onAdd,
}: {
  open: boolean;
  defaultDate: string;
  projects: { id: string; name: string }[];
  onClose: () => void;
  onAdd: (projectId: string, task: Omit<Task, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const nameRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !projectId) return;
    onAdd(projectId, { name: name.trim(), done: false, date, priority });
    setName("");
    setPriority("medium");
    onClose();
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="tasks.dialog"
    >
      <div className="bg-card border border-border rounded-2xl shadow-premium w-full max-w-md p-6 animate-[dialog-show_0.2s_ease-out]">
        {/* Header with gradient accent */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              Add Task
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a new task for your project
            </p>
          </div>
          <button
            type="button"
            data-ocid="tasks.close_button"
            onClick={onClose}
            aria-label="Close dialog"
            className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task name */}
          <div>
            <label
              className="text-sm font-medium text-foreground mb-1.5 block"
              htmlFor="task-name"
            >
              Task Name <span className="text-destructive">*</span>
            </label>
            <input
              id="task-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              required
              data-ocid="tasks.input"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          {/* Project */}
          <div>
            <label
              className="text-sm font-medium text-foreground mb-1.5 block"
              htmlFor="task-project"
            >
              Project <span className="text-destructive">*</span>
            </label>
            <select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              data-ocid="tasks.select"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="text-sm font-medium text-foreground mb-1.5 block"
                htmlFor="task-date"
              >
                Due Date
              </label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-foreground mb-1.5 block"
                htmlFor="task-priority"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              data-ocid="tasks.cancel_button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-ocid="tasks.submit_button"
              className="flex-1 px-4 py-2.5 rounded-lg gradient-accent text-white text-sm font-semibold hover:opacity-90 transition-smooth shadow-glow-accent"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Custom Tooltip for bar chart ─────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {payload[0].value}{" "}
        <span className="font-normal text-muted-foreground">completed</span>
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TasksPage() {
  const { projects, saveProject } = useLocalData();

  const today = new Date();
  const todayStr = toDateStr(today);

  // Flatten all tasks across all projects
  const allTasks: FlatTask[] = projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, projectName: p.name, projectId: p.id })),
  );

  // ─── State ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedDateStr = toDateStr(selectedDate);

  // ─── Filtered tasks ──────────────────────────────────────────────────────────
  const filteredTasks = allTasks.filter((t) => {
    if (activeFilter === "today") return t.date === todayStr;
    if (activeFilter === "tomorrow")
      return t.date === toDateStr(addDays(today, 1));
    if (activeFilter === "week") {
      if (!t.date) return false;
      const d = parseISO(t.date);
      return isWithinInterval(d, {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      });
    }
    if (activeFilter === "selected") return t.date === selectedDateStr;
    return true; // "all"
  });

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const completedToday = allTasks.filter(
    (t) => t.done && t.date === todayStr,
  ).length;
  const pendingTotal = allTasks.filter((t) => !t.done).length;
  const totalTasks = allTasks.length;
  const completionPct =
    totalTasks === 0
      ? 0
      : Math.round((allTasks.filter((t) => t.done).length / totalTasks) * 100);

  // ─── 7-day chart data ─────────────────────────────────────────────────────
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = toDateStr(day);
    const completed = allTasks.filter(
      (t) => t.done && t.date === dayStr,
    ).length;
    const isCurrentDay = dayStr === todayStr;
    return {
      day: format(day, "EEE"),
      completed,
      isToday: isCurrentDay,
    };
  });

  // ─── Calendar dot modifiers ──────────────────────────────────────────────
  const redDays: Date[] = [];
  const yellowDays: Date[] = [];
  const greenDays: Date[] = [];

  const uniqueDates = [...new Set(allTasks.map((t) => t.date).filter(Boolean))];
  for (const dateStr of uniqueDates) {
    if (!dateStr) continue;
    const color = getDotColor(allTasks, dateStr);
    const d = parseISO(dateStr);
    if (color === "red") redDays.push(d);
    else if (color === "yellow") yellowDays.push(d);
    else if (color === "green") greenDays.push(d);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────
  function handleToggle(task: FlatTask) {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project) return;
    const updated = {
      ...project,
      tasks: project.tasks.map((t) =>
        t.id === task.id ? { ...t, done: !t.done } : t,
      ),
    };
    saveProject(updated);
  }

  function handleDelete(task: FlatTask) {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project) return;
    const updated = {
      ...project,
      tasks: project.tasks.filter((t) => t.id !== task.id),
    };
    saveProject(updated);
  }

  function handleAddTask(
    projectId: string,
    taskData: Omit<Task, "id" | "createdAt">,
  ) {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    saveProject({ ...project, tasks: [...project.tasks, newTask] });
  }

  // ─── Filter config ────────────────────────────────────────────────────────
  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "week", label: "This Week" },
    { key: "selected", label: format(selectedDate, "MMM d") },
    { key: "all", label: "All" },
  ];

  // ─── Task header label ────────────────────────────────────────────────────
  const taskSummary =
    allTasks.length === 0
      ? "No tasks yet"
      : `${allTasks.filter((t) => t.done).length} of ${allTasks.length} tasks completed`;

  return (
    <div
      className="min-h-screen bg-background page-fade-in"
      data-ocid="tasks.page"
    >
      {/* ─── Gradient Page Header ──────────────────────────────────────────── */}
      <div className="gradient-header px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
              Task Manager
            </h1>
            <p className="text-sm text-white/60 mt-1">{taskSummary}</p>
          </div>
          <button
            type="button"
            data-ocid="tasks.open_modal_button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-semibold transition-smooth backdrop-blur-sm shadow-xs"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* ─── LEFT: Calendar + Stats + Chart ─── */}
          <div className="space-y-5" data-ocid="tasks.panel">
            {/* Premium Calendar Card */}
            <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
              {/* Calendar header accent bar */}
              <div className="gradient-primary px-4 py-3 flex items-center gap-2">
                <CalendarIcon className="size-4 text-white/80" />
                <h2 className="font-display font-semibold text-sm text-white">
                  Calendar
                </h2>
                <span className="ml-auto text-xs text-white/60">
                  {format(today, "MMMM yyyy")}
                </span>
              </div>
              <div className="p-3">
                <style>{`
                  .rdp-premium {
                    --rdp-cell-size: 38px;
                    margin: 0;
                    width: 100%;
                  }
                  .rdp-premium .rdp-months {
                    width: 100%;
                  }
                  .rdp-premium .rdp-month {
                    width: 100%;
                  }
                  .rdp-premium .rdp-table {
                    width: 100%;
                  }
                  .rdp-premium .rdp-caption {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 4px 10px;
                  }
                  .rdp-premium .rdp-caption_label {
                    font-family: var(--font-display, sans-serif);
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: oklch(var(--foreground));
                    pointer-events: none;
                  }
                  .rdp-premium .rdp-nav {
                    display: flex;
                    gap: 4px;
                  }
                  .rdp-premium .rdp-nav_button {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: oklch(var(--muted));
                    border: 1px solid oklch(var(--border));
                    color: oklch(var(--foreground));
                    transition: all 0.15s ease;
                    cursor: pointer;
                  }
                  .rdp-premium .rdp-nav_button:hover {
                    background: oklch(var(--primary));
                    color: oklch(var(--primary-foreground));
                    border-color: oklch(var(--primary));
                  }
                  .rdp-premium .rdp-head_cell {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: oklch(var(--muted-foreground));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding-bottom: 4px;
                  }
                  .rdp-premium .rdp-tbody td {
                    padding: 1px;
                  }
                  .dot-red { background: #ef4444; }
                  .dot-yellow { background: #f59e0b; }
                  .dot-green { background: #22c55e; }
                `}</style>
                <DayPicker
                  className="rdp-premium"
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(d);
                      setActiveFilter("selected");
                    }
                  }}
                  modifiers={{
                    redDay: redDays,
                    yellowDay: yellowDays,
                    greenDay: greenDays,
                  }}
                  components={{
                    Chevron: ({ orientation }: { orientation?: string }) =>
                      orientation === "left" ? (
                        <ChevronLeft className="size-3.5" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      ),
                    DayButton: ({
                      day,
                      modifiers: _mod,
                      ...buttonProps
                    }: {
                      day: CalendarDay;
                      modifiers: Record<string, boolean>;
                    } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
                      const ds = toDateStr(day.date);
                      const dot = getDotColor(allTasks, ds);
                      const isSelected = ds === toDateStr(selectedDate);
                      const isCurrentDay = isToday(day.date);
                      return (
                        <div
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <button
                            {...buttonProps}
                            type="button"
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isSelected
                                ? "gradient-primary text-white shadow-glow font-bold"
                                : isCurrentDay
                                  ? "font-bold text-primary ring-1 ring-primary/40"
                                  : "text-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                            onClick={(e) => {
                              buttonProps.onClick?.(e);
                              setSelectedDate(day.date);
                              setActiveFilter("selected");
                            }}
                          >
                            {format(day.date, "d")}
                          </button>
                          {dot && (
                            <span
                              className={`dot-${dot} size-1 rounded-full mt-0.5`}
                            />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </div>
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Done Today"
                value={completedToday}
                icon={CheckCircle2}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                label="Pending"
                value={pendingTotal}
                icon={Clock}
                color="bg-amber-100 text-amber-600"
              />
              <CircularProgress pct={completionPct} />
            </div>

            {/* 7-Day Bar Chart */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="size-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Last 7 Days
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} barSize={20} barCategoryGap="20%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "oklch(var(--muted))", radius: 6 }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.day}
                        fill={
                          entry.isToday
                            ? "oklch(0.62 0.20 275)"
                            : "oklch(0.22 0.055 265)"
                        }
                        opacity={entry.completed === 0 ? 0.3 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ─── RIGHT: Filters + Task List ─── */}
          <div className="space-y-4">
            {/* Pill-style filter tabs */}
            <div
              className="flex items-center gap-2 flex-wrap"
              data-ocid="tasks.filter.tab"
            >
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1 shadow-card flex-wrap">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    data-ocid={`tasks.filter.${f.key}`}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                      activeFilter === f.key
                        ? "gradient-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-xs text-muted-foreground font-medium">
                {filteredTasks.length}{" "}
                {filteredTasks.length !== 1 ? "tasks" : "task"}
              </span>
            </div>

            {/* Task list or empty state */}
            {filteredTasks.length === 0 ? (
              <div
                className="bg-card border border-border rounded-2xl shadow-card"
                data-ocid="tasks.empty_state"
              >
                <EmptyState
                  icon={CalendarX}
                  title="No tasks on this date"
                  description="Click Add Task to create one, or select a different date on the calendar."
                  ctaLabel="Add Task"
                  onCta={() => setDialogOpen(true)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i + 1}
                    onToggle={() => handleToggle(task)}
                    onDelete={() => handleDelete(task)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setDialogOpen(true)}
        label="Add Task"
        data-ocid="tasks.fab.add_button"
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={dialogOpen}
        defaultDate={selectedDateStr}
        projects={projects}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}
