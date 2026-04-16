import { Card } from "@/components/Card";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskProgressBar } from "@/components/TaskProgressBar";
import { useLocalData } from "@/hooks/useLocalData";
import { formatCurrency, getDeadlineStatus, getPaymentStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FolderOpen,
  FolderPlus,
  ListChecks,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Greeting helpers ────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  variant?: "default" | "premium";
  delay?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  iconBg,
  iconColor,
  valueColor = "text-foreground",
  variant = "default",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="animate-item-in"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <Card variant={variant} hoverable>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p
              className={`text-2xl font-display font-bold mt-1.5 ${valueColor}`}
            >
              {value}
            </p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {sub}
              </p>
            )}
          </div>
          <div
            className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <Icon className={`size-5 ${iconColor}`} />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Quick Action Dropdown ───────────────────────────────────────────────────

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  ocid: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: UserPlus,
    label: "Add Client",
    to: "/clients",
    ocid: "fab.client_link",
  },
  {
    icon: FolderPlus,
    label: "New Project",
    to: "/projects",
    ocid: "fab.project_link",
  },
  {
    icon: ListChecks,
    label: "View Tasks",
    to: "/tasks",
    ocid: "fab.tasks_link",
  },
];

function QuickActionMenu({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-24 right-6 z-50 flex flex-col gap-2"
      data-ocid="fab.dropdown_menu"
    >
      {QUICK_ACTIONS.map(({ icon: Icon, label, to, ocid }) => (
        <button
          key={to}
          type="button"
          data-ocid={ocid}
          onClick={() => {
            onNavigate(to);
            onClose();
          }}
          className="flex items-center gap-3 bg-card border border-border shadow-premium rounded-full pl-4 pr-5 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:-translate-y-0.5 hover:shadow-elevated hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="size-7 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
            <Icon className="size-3.5 text-white" />
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const { clients, projects, stats } = useLocalData();
  const [fabOpen, setFabOpen] = useState(false);

  // Split earnings by currency for display
  const inrEarnings = projects.reduce(
    (s, p) => (p.paidCurrency === "USD" ? s : s + p.paidAmount),
    0,
  );
  const usdEarnings = projects.reduce(
    (s, p) => (p.paidCurrency === "USD" ? s + p.paidAmount : s),
    0,
  );
  const earningsDisplay =
    usdEarnings > 0 && inrEarnings > 0
      ? `${formatCurrency(inrEarnings, "INR")} + ${formatCurrency(usdEarnings, "USD")}`
      : usdEarnings > 0
        ? formatCurrency(usdEarnings, "USD")
        : formatCurrency(inrEarnings, "INR");

  // Split pending payments by currency
  const inrPending = projects.reduce((s, p) => {
    const rem = p.budget - p.paidAmount;
    return p.budgetCurrency === "USD" || rem <= 0 ? s : s + rem;
  }, 0);
  const usdPending = projects.reduce((s, p) => {
    const rem = p.budget - p.paidAmount;
    return p.budgetCurrency === "USD" && rem > 0 ? s + rem : s;
  }, 0);
  const pendingDisplay =
    usdPending > 0 && inrPending > 0
      ? `${formatCurrency(inrPending, "INR")} + ${formatCurrency(usdPending, "USD")}`
      : usdPending > 0
        ? formatCurrency(usdPending, "USD")
        : formatCurrency(inrPending, "INR");

  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const overdueList = projects.filter(
    (p) =>
      p.status !== "Completed" && getDeadlineStatus(p.deadline) === "Overdue",
  );

  const upcomingDeadlines = projects
    .filter((p) => {
      const d = new Date(p.deadline);
      const now = new Date();
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return p.status !== "Completed" && diff >= 0 && diff <= 7;
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

  return (
    <div className="page-fade-in" data-ocid="dashboard.page">
      {/* ── Gradient Hero Header ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.13 0.04 265) 0%, oklch(0.18 0.065 275) 55%, oklch(0.25 0.10 285) 100%)",
        }}
        data-ocid="dashboard.hero_section"
      >
        {/* Decorative orbs */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.20 275) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 size-48 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.18 260) 0%, transparent 70%)",
          }}
        />

        <div className="relative px-6 py-10">
          {/* Greeting pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
            <Zap className="size-3 text-yellow-300" />
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">
              Agency Dashboard
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
            {getGreeting()}, Agency
          </h1>
          <p className="text-white/60 mt-2 text-sm sm:text-base max-w-md">
            Here is your agency performance overview. Stay on top of projects,
            clients, and deadlines.
          </p>

          {/* Quick summary strip */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-glow-success" />
              <span className="text-xs text-white/70 font-medium">
                {stats.activeProjects} active project
                {stats.activeProjects !== 1 ? "s" : ""}
              </span>
            </div>
            {stats.overdueProjects > 0 && (
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-rose-400" />
                <span className="text-xs text-white/70 font-medium">
                  {stats.overdueProjects} overdue
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-violet-400" />
              <span className="text-xs text-white/70 font-medium">
                {stats.tasksCompletedPercent.toFixed(0)}% tasks done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────── */}
      <div className="p-6 space-y-8">
        {/* ── Stats Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Clients"
            value={stats.totalClients}
            icon={Users}
            sub="Managed accounts"
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            delay={0}
          />
          <StatCard
            label="Active Projects"
            value={stats.activeProjects}
            icon={TrendingUp}
            sub="In progress"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            delay={50}
          />
          <StatCard
            label="Completed"
            value={stats.completedProjects}
            icon={CheckCircle2}
            sub="Delivered"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            valueColor="text-emerald-700"
            delay={100}
          />
          <StatCard
            label="Total Earnings"
            value={earningsDisplay}
            icon={DollarSign}
            sub="Revenue collected"
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            valueColor="text-violet-700"
            variant="premium"
            delay={150}
          />
          <StatCard
            label="Overdue Projects"
            value={stats.overdueProjects}
            icon={AlertTriangle}
            sub={
              stats.overdueProjects === 0 ? "All on track ✓" : "Need attention"
            }
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
            valueColor={
              stats.overdueProjects > 0 ? "text-rose-700" : "text-foreground"
            }
            delay={200}
          />
          <StatCard
            label="Pending Payments"
            value={pendingDisplay}
            icon={CreditCard}
            sub="Remaining balance"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            valueColor={
              stats.pendingPaymentsTotal > 0
                ? "text-orange-700"
                : "text-foreground"
            }
            delay={250}
          />
          <StatCard
            label="Tasks Done"
            value={`${stats.tasksCompletedPercent.toFixed(1)}%`}
            icon={ListChecks}
            sub="Across all projects"
            iconBg="bg-sky-100"
            iconColor="text-sky-600"
            valueColor="text-sky-700"
            delay={300}
          />
        </div>

        {/* ── Overdue Alert Banner ──────────────────────────────────── */}
        {overdueList.length > 0 && (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 animate-item-in"
            data-ocid="dashboard.overdue_alert"
          >
            <div className="size-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="size-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {overdueList.length} overdue{" "}
                {overdueList.length === 1
                  ? "project requires"
                  : "projects require"}{" "}
                attention
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {overdueList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      navigate({ to: "/projects/$id", params: { id: p.id } })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Projects + Upcoming Deadlines ─────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full gradient-accent inline-block" />
              Recent Projects
            </h2>
            {recentProjects.length === 0 ? (
              <Card data-ocid="dashboard.projects.empty_state">
                <EmptyState
                  icon={FolderOpen}
                  title="No projects yet"
                  description="Add a client first, then create your first project to get started."
                  ctaLabel="Go to Clients"
                  onCta={() => navigate({ to: "/clients" })}
                  size="sm"
                  data-ocid="dashboard.projects.empty_state"
                />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {recentProjects.map((project, i) => {
                  const client = clients.find((c) => c.id === project.clientId);
                  const paymentStatus = getPaymentStatus(
                    project.budget,
                    project.paidAmount,
                  );
                  const completedTasks = project.tasks.filter(
                    (t) => t.done,
                  ).length;
                  const totalTasks = project.tasks.length;

                  return (
                    <div
                      key={project.id}
                      className="animate-item-in"
                      style={
                        { animationDelay: `${i * 60}ms` } as React.CSSProperties
                      }
                    >
                      <Card
                        hoverable
                        padding="sm"
                        onClick={() =>
                          navigate({
                            to: "/projects/$id",
                            params: { id: project.id },
                          })
                        }
                        data-ocid={`dashboard.project.item.${i + 1}`}
                      >
                        {/* Row 1: name + status */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-snug">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {client?.businessName ??
                                client?.name ??
                                "Unknown client"}
                            </p>
                          </div>
                          <StatusBadge status={project.status} size="sm" />
                        </div>

                        {/* Row 2: badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <DeadlineBadge
                            deadline={project.deadline}
                            status={project.status}
                          />
                          <PaymentBadge status={paymentStatus} />
                          {totalTasks > 0 && (
                            <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                              {completedTasks}/{totalTasks} tasks
                            </span>
                          )}
                        </div>

                        {/* Row 3: progress */}
                        {totalTasks > 0 && (
                          <div className="mt-2.5">
                            <TaskProgressBar
                              tasks={project.tasks}
                              showLabel={false}
                            />
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Upcoming Deadlines
              <span className="text-xs font-medium text-muted-foreground ml-auto">
                Next 7 days
              </span>
            </h2>
            {upcomingDeadlines.length === 0 ? (
              <Card>
                <EmptyState
                  icon={CheckCircle2}
                  title="All clear!"
                  description="No deadlines in the next 7 days. Keep up the great work."
                  size="sm"
                />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((project, i) => {
                  const daysLeft = Math.ceil(
                    (new Date(project.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const paymentStatus = getPaymentStatus(
                    project.budget,
                    project.paidAmount,
                  );
                  const urgencyClass =
                    daysLeft === 0
                      ? "bg-rose-100 text-rose-700 border-rose-200"
                      : daysLeft <= 2
                        ? "bg-orange-100 text-orange-700 border-orange-200"
                        : "bg-sky-100 text-sky-700 border-sky-200";

                  return (
                    <div
                      key={project.id}
                      className="animate-item-in"
                      style={
                        { animationDelay: `${i * 60}ms` } as React.CSSProperties
                      }
                    >
                      <Card
                        hoverable
                        padding="sm"
                        onClick={() =>
                          navigate({
                            to: "/projects/$id",
                            params: { id: project.id },
                          })
                        }
                        data-ocid={`dashboard.deadline.item.${i + 1}`}
                      >
                        {/* Row 1: name + urgency pill */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-snug">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due{" "}
                              {new Date(project.deadline).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold flex-shrink-0 px-2.5 py-0.5 rounded-full border ${urgencyClass}`}
                          >
                            {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                          </span>
                        </div>

                        {/* Row 2: badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <DeadlineBadge
                            deadline={project.deadline}
                            status={project.status}
                          />
                          <PaymentBadge status={paymentStatus} />
                        </div>

                        {project.tasks.length > 0 && (
                          <div className="mt-2.5">
                            <TaskProgressBar tasks={project.tasks} showLabel />
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Action Button + Quick Menu ──────────────────────── */}
      <QuickActionMenu
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        onNavigate={(to) => navigate({ to: to as "/" })}
      />
      <FloatingActionButton
        onClick={() => setFabOpen((v) => !v)}
        label="Quick Add"
        data-ocid="dashboard.fab.add_button"
      />
    </div>
  );
}
