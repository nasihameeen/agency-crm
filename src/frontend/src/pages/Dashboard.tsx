import { Card } from "@/components/Card";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskProgressBar } from "@/components/TaskProgressBar";
import { useLocalData } from "@/hooks/useLocalData";
import { getDeadlineStatus, getPaymentStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FolderOpen,
  ListChecks,
  TrendingUp,
  Users,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  variant?: "default" | "rose" | "orange" | "sky";
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  variant = "default",
}: StatCardProps) {
  const variantStyles: Record<
    NonNullable<StatCardProps["variant"]>,
    { icon: string; card: string }
  > = {
    default: { icon: "bg-primary/10 text-primary", card: "" },
    rose: { icon: "bg-rose-100 text-rose-600", card: "" },
    orange: { icon: "bg-orange-100 text-orange-600", card: "" },
    sky: { icon: "bg-sky-100 text-sky-600", card: "" },
  };

  const valueStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
    default: "text-foreground",
    rose: "text-rose-700",
    orange: "text-orange-700",
    sky: "text-sky-700",
  };

  const s = variantStyles[variant];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p
            className={`text-2xl font-display font-bold mt-1 ${valueStyles[variant]}`}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.icon}`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { clients, projects, stats } = useLocalData();

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
    <div className="p-6 space-y-8" data-ocid="dashboard.page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back — here's your agency overview.
        </p>
      </div>

      {/* Stats Grid — 2 cols mobile, 4 cols lg, 7 total cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          icon={Users}
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={TrendingUp}
        />
        <StatCard
          label="Completed"
          value={stats.completedProjects}
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          label="Overdue Projects"
          value={stats.overdueProjects}
          icon={AlertTriangle}
          variant="rose"
          sub={stats.overdueProjects === 0 ? "All on track" : "Need attention"}
        />
        <StatCard
          label="Pending Payments"
          value={`$${stats.pendingPaymentsTotal.toLocaleString()}`}
          icon={CreditCard}
          variant="orange"
          sub="Remaining balance"
        />
        <StatCard
          label="Tasks Done"
          value={`${stats.tasksCompletedPercent.toFixed(1)}%`}
          icon={ListChecks}
          variant="sky"
          sub="Across all projects"
        />
      </div>

      {/* Overdue Alert */}
      {overdueList.length > 0 && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 flex items-start gap-3"
          data-ocid="dashboard.overdue_alert"
        >
          <AlertCircle className="size-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-800">
              {overdueList.length} overdue{" "}
              {overdueList.length === 1 ? "project" : "projects"}
            </p>
            <p className="text-xs text-rose-700 mt-0.5">
              {overdueList.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Recent Projects + Upcoming Deadlines */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
            Recent Projects
          </h2>
          {recentProjects.length === 0 ? (
            <Card
              className="text-center py-10"
              data-ocid="dashboard.projects.empty_state"
            >
              <FolderOpen className="size-9 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No projects yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Add a client first, then create your first project.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/clients" })}
                className="text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                data-ocid="dashboard.go_to_clients.link"
              >
                Go to Clients →
              </button>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project, i) => {
                const client = clients.find((c) => c.id === project.clientId);
                const paymentStatus = getPaymentStatus(
                  project.budget,
                  project.paidAmount,
                );
                return (
                  <Card
                    key={project.id}
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
                    {/* Row 1: name + status badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client?.name ?? "Unknown client"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                    </div>

                    {/* Row 2: badges + progress */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <DeadlineBadge
                        deadline={project.deadline}
                        status={project.status}
                      />
                      <PaymentBadge status={paymentStatus} />
                    </div>

                    {project.tasks.length > 0 && (
                      <div className="mt-2">
                        <TaskProgressBar tasks={project.tasks} showLabel />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock className="size-3.5" /> Upcoming Deadlines (7 days)
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <Card className="text-center py-10">
              <CheckCircle2 className="size-9 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                All clear!
              </p>
              <p className="text-xs text-muted-foreground">
                No deadlines in the next 7 days.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((project, i) => {
                const daysLeft = Math.ceil(
                  (new Date(project.deadline).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                );
                const paymentStatus = getPaymentStatus(
                  project.budget,
                  project.paidAmount,
                );
                return (
                  <Card
                    key={project.id}
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
                    {/* Row 1: name + days left */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${
                          daysLeft === 0
                            ? "bg-rose-100 text-rose-700"
                            : daysLeft <= 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                      </span>
                    </div>

                    {/* Row 2: badges */}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <DeadlineBadge
                        deadline={project.deadline}
                        status={project.status}
                      />
                      <PaymentBadge status={paymentStatus} />
                    </div>

                    {project.tasks.length > 0 && (
                      <div className="mt-2">
                        <TaskProgressBar tasks={project.tasks} showLabel />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
