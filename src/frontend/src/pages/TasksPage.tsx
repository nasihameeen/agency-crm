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
  CheckCircle2,
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

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
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-card">
      <div
        className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-display font-semibold text-foreground leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

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
      className={`flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-smooth group animate-item-in ${
        task.done ? "opacity-60" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        data-ocid={`tasks.checkbox.${index}`}
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
      >
        <CheckCircle2
          className={`size-5 transition-colors ${
            task.done
              ? "text-green-500"
              : "text-muted-foreground hover:text-primary"
          }`}
        />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.done ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground truncate">
            {task.projectName}
          </span>
          {task.date && (
            <span
              className={`text-xs font-medium ${
                overdue
                  ? "text-red-600"
                  : task.done
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
              }`}
            >
              · {overdue ? "Overdue · " : ""}
              {format(parseISO(task.date), "MMM d")}
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_STYLES[priority]}`}
      >
        {PRIORITY_LABEL[priority]}
      </span>

      {/* Delete */}
      <button
        type="button"
        data-ocid={`tasks.delete_button.${index}`}
        onClick={onDelete}
        className="flex-shrink-0 size-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Delete task"
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
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-[dialog-show_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-foreground">
            Add Task
          </h2>
          <button
            type="button"
            data-ocid="tasks.close_button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
                Date
              </label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-ocid="tasks.submit_button"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </dialog>
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
    return {
      day: format(day, "EEE"),
      completed: allTasks.filter((t) => t.done && t.date === dayStr).length,
    };
  });

  // ─── Calendar dot modifiers ──────────────────────────────────────────────
  const redDays: Date[] = [];
  const yellowDays: Date[] = [];
  const greenDays: Date[] = [];

  // Collect unique dates with tasks
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

  // ─── Filter labels ────────────────────────────────────────────────────────
  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "week", label: "This Week" },
    { key: "selected", label: `${format(selectedDate, "MMM d")}` },
    { key: "all", label: "All" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto" data-ocid="tasks.page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all your tasks across projects
          </p>
        </div>
        <button
          type="button"
          data-ocid="tasks.open_modal_button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-smooth shadow-xs"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* ─── LEFT: Calendar + Stats + Chart ─── */}
        <div className="space-y-5" data-ocid="tasks.panel">
          {/* Calendar */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="size-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Calendar
              </h2>
            </div>
            <style>{`
              .rdp {
                --rdp-cell-size: 36px;
                --rdp-accent-color: oklch(var(--primary));
                --rdp-background-color: oklch(var(--primary) / 0.1);
                margin: 0;
              }
              .rdp-day_selected:not([disabled]) { background-color: oklch(var(--primary)); color: oklch(var(--primary-foreground)); }
              .rdp-day_today:not(.rdp-day_selected) { font-weight: 700; color: oklch(var(--primary)); }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: oklch(var(--muted)); }
              .rdp-head_cell { font-size: 0.7rem; font-weight: 600; color: oklch(var(--muted-foreground)); }
              .rdp-caption { padding: 0 0 8px; }
              .rdp-nav_button { color: oklch(var(--foreground)); }
              .dot-red { background: #ef4444; }
              .dot-yellow { background: #f59e0b; }
              .dot-green { background: #22c55e; }
            `}</style>
            <DayPicker
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
                        justifyContent: "center",
                      }}
                    >
                      <button
                        {...buttonProps}
                        type="button"
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : isCurrentDay
                              ? "font-bold text-primary"
                              : "hover:bg-muted text-foreground"
                        }`}
                        onClick={(e) => {
                          buttonProps.onClick?.(e);
                          setSelectedDate(day.date);
                          setActiveFilter("selected");
                        }}
                      >
                        {format(day.date, "d")}
                        {dot && (
                          <span
                            className={`dot-${dot} absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full`}
                          />
                        )}
                      </button>
                    </div>
                  );
                },
              }}
            />
          </div>

          {/* Quick Stats */}
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
            <StatCard
              label="Done %"
              value={`${completionPct}%`}
              icon={BarChart2}
              color="bg-primary/10 text-primary"
            />
          </div>

          {/* 7-Day Completion Chart */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <h2 className="font-display font-semibold text-sm text-foreground mb-4">
              Last 7 Days
            </h2>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} barSize={18}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "oklch(var(--muted))" }}
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "oklch(var(--foreground))",
                  }}
                  formatter={(v: number) => [v, "Completed"]}
                />
                <Bar
                  dataKey="completed"
                  fill="oklch(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── RIGHT: Filters + Task List ─── */}
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div
            className="flex items-center gap-2 flex-wrap"
            data-ocid="tasks.filter.tab"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                data-ocid={`tasks.filter.${f.key}`}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                  activeFilter === f.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div
              data-ocid="tasks.empty_state"
              className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-card"
            >
              <div className="size-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <CheckCircle2 className="size-7 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold text-foreground mb-1">
                No tasks here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {activeFilter === "today" || activeFilter === "selected"
                  ? "No tasks for this date. Add one to get started!"
                  : "No tasks match this filter."}
              </p>
              <button
                type="button"
                data-ocid="tasks.open_modal_button"
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-smooth"
              >
                <Plus className="size-4" />
                Add Task
              </button>
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
