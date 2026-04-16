import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskProgressBar } from "@/components/TaskProgressBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/useToast";
import type { CurrencyType, Project, ProjectStatus } from "@/types";
import {
  type DeadlineStatus,
  type PaymentStatus as PaymentStatusType,
  formatCurrency,
  getDeadlineStatus,
  getPaymentStatus,
  getTaskProgress,
} from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  FolderOpen,
  LayoutGrid,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

type ViewMode = "list" | "grid";

type ProjectForm = Omit<
  Project,
  "id" | "tasks" | "notes" | "links" | "createdAt"
>;

const EMPTY_FORM: ProjectForm = {
  clientId: "",
  name: "",
  description: "",
  budget: 0,
  budgetCurrency: "INR",
  paidAmount: 0,
  paidCurrency: "INR",
  deadline: new Date().toISOString().split("T")[0],
  status: "Pending",
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

const CURRENCY_OPTIONS: { value: CurrencyType; label: string }[] = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
];

const STATUS_FILTER_TABS = [
  "All",
  "Pending",
  "InProgress",
  "Completed",
] as const;
const PAYMENT_FILTER_TABS: Array<PaymentStatusType | "All"> = [
  "All",
  "Paid",
  "Partial",
  "Unpaid",
];
const DEADLINE_FILTER_TABS: Array<DeadlineStatus | "All"> = [
  "All",
  "Overdue",
  "Upcoming",
];

/** Smart sort: overdue first → nearest deadline → no deadline last */
function sortProjects(projects: Project[]): Project[] {
  const now = Date.now();
  return [...projects].sort((a, b) => {
    const aMs = a.deadline ? new Date(a.deadline).getTime() : null;
    const bMs = b.deadline ? new Date(b.deadline).getTime() : null;
    const aOverdue = aMs !== null && aMs < now;
    const bOverdue = bMs !== null && bMs < now;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Both overdue or both not — sort by deadline asc; no deadline goes last
    if (aMs === null && bMs === null) return 0;
    if (aMs === null) return 1;
    if (bMs === null) return -1;
    return aMs - bMs;
  });
}

function FilterPill({
  label,
  active,
  onClick,
  ocid,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={[
        "px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.03]"
          : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { clients, projects, saveProject, deleteProject } = useLocalData();
  const { success, error } = useToast();

  // View toggle — default to list
  const [view, setView] = useState<ViewMode>("list");

  // Shared filter state persists across view switches
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">(
    "All",
  );
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatusType | "All">(
    "All",
  );
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineStatus | "All">(
    "All",
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "All" ||
    paymentFilter !== "All" ||
    deadlineFilter !== "All";

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDeadlineFilter("All");
  }

  const filtered = sortProjects(
    projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchPayment =
        paymentFilter === "All" ||
        getPaymentStatus(p.budget, p.paidAmount) === paymentFilter;
      const matchDeadline =
        deadlineFilter === "All" ||
        getDeadlineStatus(p.deadline) === deadlineFilter;
      return matchSearch && matchStatus && matchPayment && matchDeadline;
    }),
  );

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, clientId: clients[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({
      clientId: p.clientId,
      name: p.name,
      description: p.description,
      budget: p.budget,
      budgetCurrency: p.budgetCurrency ?? "INR",
      paidAmount: p.paidAmount,
      paidCurrency: p.paidCurrency ?? "INR",
      deadline: p.deadline,
      status: p.status,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      error("Project name is required");
      return;
    }
    if (!form.clientId) {
      error("Select a client");
      return;
    }
    saveProject(
      editTarget
        ? { ...editTarget, ...form }
        : {
            ...form,
            id: crypto.randomUUID(),
            tasks: [],
            notes: [],
            links: [],
            createdAt: Date.now(),
          },
    );
    success(editTarget ? "Project updated" : "Project created");
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    success("Project deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 space-y-6 page-fade-in" data-ocid="projects.page">
      {/* Gradient Header */}
      <div className="gradient-header rounded-2xl p-6 text-white shadow-elevated">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              Projects
            </h1>
            <p className="text-sm mt-1 opacity-70">
              {projects.length} total project{projects.length !== 1 ? "s" : ""}
              {filtered.length !== projects.length && (
                <span className="ml-1 opacity-60">
                  · {filtered.length} shown
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div
              className="flex items-center bg-white/10 border border-white/20 rounded-lg p-0.5 backdrop-blur-sm"
              aria-label="View mode"
            >
              <button
                type="button"
                data-ocid="projects.view_list_toggle"
                onClick={() => setView("list")}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                  view === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/80 hover:text-white",
                ].join(" ")}
              >
                <LayoutList className="size-3.5" /> List
              </button>
              <button
                type="button"
                data-ocid="projects.view_grid_toggle"
                onClick={() => setView("grid")}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                  view === "grid"
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/80 hover:text-white",
                ].join(" ")}
              >
                <LayoutGrid className="size-3.5" /> Grid
              </button>
            </div>
            <Button
              data-ocid="projects.add_button"
              onClick={openAdd}
              className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all duration-200"
              variant="outline"
            >
              <Plus className="size-4" /> New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <Card padding="md" className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            data-ocid="projects.search_input"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter rows */}
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14 shrink-0">
              Status
            </span>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTER_TABS.map((s) => (
                <FilterPill
                  key={s}
                  label={s === "InProgress" ? "In Progress" : s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  ocid={`projects.status_filter.${s.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14 shrink-0">
              Payment
            </span>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_FILTER_TABS.map((s) => (
                <FilterPill
                  key={s}
                  label={s}
                  active={paymentFilter === s}
                  onClick={() => setPaymentFilter(s)}
                  ocid={`projects.payment_filter.${s.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14 shrink-0">
              Due
            </span>
            <div className="flex gap-2 flex-wrap">
              {DEADLINE_FILTER_TABS.map((s) => (
                <FilterPill
                  key={s}
                  label={s}
                  active={deadlineFilter === s}
                  onClick={() => setDeadlineFilter(s)}
                  ocid={`projects.deadline_filter.${s.toLowerCase()}`}
                />
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="pt-1 border-t border-border/50">
            <button
              type="button"
              data-ocid="projects.clear_filters_button"
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </Card>

      {/* Results */}
      {projects.length === 0 ? (
        <Card data-ocid="projects.empty_state" className="border-dashed">
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project to start tracking work, tasks, and payments."
            ctaLabel="New Project"
            onCta={openAdd}
          />
          <div className="flex justify-center mt-2 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              data-ocid="projects.goto_clients_link"
              onClick={() => navigate({ to: "/clients" })}
            >
              <Users className="size-4" /> Go to Clients
            </Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card data-ocid="projects.no_match_state" className="border-dashed">
          <EmptyState
            icon={Search}
            title="No projects match these filters"
            description="Try adjusting your search or clearing filters to see all projects."
            ctaLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onCta={hasActiveFilters ? clearFilters : undefined}
          />
        </Card>
      ) : view === "list" ? (
        /* ── LIST VIEW ─────────────────────────────────────────────── */
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto" data-ocid="projects.list">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Remaining
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap min-w-[120px]">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((project, i) => {
                  const client = clients.find((c) => c.id === project.clientId);
                  const budgetCurrency = project.budgetCurrency ?? "INR";
                  const paidCurrency = project.paidCurrency ?? "INR";
                  const remaining = project.budget - project.paidAmount;
                  const paymentStatus = getPaymentStatus(
                    project.budget,
                    project.paidAmount,
                  );
                  const deadlineStatus = getDeadlineStatus(project.deadline);
                  const {
                    percent: taskPct,
                    done,
                    total,
                  } = getTaskProgress(project.tasks);
                  const isOverdue = deadlineStatus === "Overdue";

                  return (
                    <tr
                      key={project.id}
                      data-ocid={`projects.item.${i + 1}`}
                      className={[
                        "group transition-colors duration-150 cursor-pointer",
                        isOverdue
                          ? "bg-destructive/[0.03] hover:bg-destructive/[0.06]"
                          : "hover:bg-muted/40",
                      ].join(" ")}
                      tabIndex={0}
                      onClick={() =>
                        navigate({
                          to: "/projects/$id",
                          params: { id: project.id },
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate({
                            to: "/projects/$id",
                            params: { id: project.id },
                          });
                        }
                      }}
                    >
                      {/* Project Name */}
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap max-w-[200px]">
                        <span className="truncate block">{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground font-normal truncate block max-w-[180px]">
                            {project.description}
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <span className="truncate block max-w-[140px]">
                          {client?.name ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={project.status} size="sm" />
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PaymentBadge status={paymentStatus} size="sm" />
                      </td>

                      {/* Budget */}
                      <td className="px-4 py-3 text-right font-mono text-foreground whitespace-nowrap tabular-nums">
                        {formatCurrency(project.budget, budgetCurrency)}
                      </td>

                      {/* Paid */}
                      <td className="px-4 py-3 text-right font-mono text-success whitespace-nowrap tabular-nums">
                        {formatCurrency(project.paidAmount, paidCurrency)}
                      </td>

                      {/* Remaining */}
                      <td
                        className={[
                          "px-4 py-3 text-right font-mono whitespace-nowrap tabular-nums",
                          remaining > project.budget * 0.5
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {formatCurrency(remaining, budgetCurrency)}
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DeadlineBadge
                          deadline={project.deadline}
                          status={project.status}
                          size="sm"
                        />
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3 min-w-[120px]">
                        {total > 0 ? (
                          <div className="space-y-1">
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${taskPct}%`,
                                  background:
                                    taskPct === 100
                                      ? "oklch(0.52 0.18 142)"
                                      : "linear-gradient(90deg, oklch(0.52 0.18 142), oklch(0.62 0.20 275))",
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {done}/{total} tasks
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            data-ocid={`projects.edit_button.${i + 1}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-muted"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(project);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            data-ocid={`projects.delete_button.${i + 1}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(project);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* ── GRID VIEW ─────────────────────────────────────────────── */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const client = clients.find((c) => c.id === project.clientId);
            const budgetCurrency = project.budgetCurrency ?? "INR";
            const paidCurrency = project.paidCurrency ?? "INR";
            const remaining = project.budget - project.paidAmount;
            const paymentStatus = getPaymentStatus(
              project.budget,
              project.paidAmount,
            );
            const paidPct =
              project.budget > 0
                ? Math.min(100, (project.paidAmount / project.budget) * 100)
                : 0;
            const isHighUnpaid =
              project.budget > 0 && remaining / project.budget > 0.5;

            return (
              <Card
                key={project.id}
                hoverable
                variant="premium"
                onClick={() =>
                  navigate({ to: "/projects/$id", params: { id: project.id } })
                }
                data-ocid={`projects.item.${i + 1}`}
                className="group flex flex-col gap-0 !p-0 overflow-hidden"
              >
                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Name + client */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-foreground truncate text-base leading-tight">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {client?.name ?? "Unknown client"}
                        {client?.businessName
                          ? ` · ${client.businessName}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={project.status} size="sm" />
                    <PaymentBadge status={paymentStatus} size="sm" />
                    <DeadlineBadge
                      deadline={project.deadline}
                      status={project.status}
                      size="sm"
                    />
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Budget bar — paid vs remaining */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-success font-semibold">
                        Paid {formatCurrency(project.paidAmount, paidCurrency)}
                      </span>
                      <span
                        className={
                          isHighUnpaid
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {formatCurrency(remaining, budgetCurrency)} left
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${paidPct}%`,
                          background:
                            paidPct === 100
                              ? "oklch(0.52 0.18 142)"
                              : "linear-gradient(90deg, oklch(0.52 0.18 142), oklch(0.62 0.20 275))",
                        }}
                      />
                    </div>
                  </div>

                  {/* Task progress */}
                  {project.tasks.length > 0 && (
                    <TaskProgressBar tasks={project.tasks} showLabel />
                  )}
                </div>

                {/* Card footer — actions */}
                <div
                  className="flex items-center gap-1 px-4 py-2.5 border-t border-border/60 bg-muted/30"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <Button
                    data-ocid={`projects.edit_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(project);
                    }}
                  >
                    <Pencil className="size-3" /> Edit
                  </Button>
                  <Button
                    data-ocid={`projects.delete_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(project);
                    }}
                  >
                    <Trash2 className="size-3" /> Delete
                  </Button>
                  <ChevronRight className="size-4 text-muted-foreground ml-auto group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={openAdd}
        label="New Project"
        data-ocid="projects.fab_add_button"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="projects.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Client */}
            <div className="space-y-1.5">
              <Label>
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger data-ocid="projects.client_select">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Name */}
            <div className="space-y-1.5">
              <Label>
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="projects.name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                data-ocid="projects.description_input"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Budget + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Budget</Label>
                <Input
                  data-ocid="projects.budget_input"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, budget: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={form.budgetCurrency}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      budgetCurrency: v as CurrencyType,
                      paidCurrency: v as CurrencyType,
                    }))
                  }
                >
                  <SelectTrigger data-ocid="projects.budget_currency_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Paid Amount + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Paid Amount</Label>
                <Input
                  data-ocid="projects.paid_input"
                  type="number"
                  min={0}
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      paidAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={form.paidCurrency}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      paidCurrency: v as CurrencyType,
                    }))
                  }
                >
                  <SelectTrigger data-ocid="projects.paid_currency_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input
                  data-ocid="projects.deadline_input"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as ProjectStatus }))
                  }
                >
                  <SelectTrigger data-ocid="projects.status_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="projects.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button data-ocid="projects.submit_button" onClick={handleSave}>
              {editTarget ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Project"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
