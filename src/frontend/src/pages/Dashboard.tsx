import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { useLocalData } from "@/hooks/useLocalData";
import type { DashboardStats } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderOpen,
  TrendingUp,
  Users,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { clients, projects } = useLocalData();

  const stats: DashboardStats = {
    totalClients: clients.length,
    activeProjects: projects.filter((p) => p.status === "InProgress").length,
    completedProjects: projects.filter((p) => p.status === "Completed").length,
    totalEarnings: projects.reduce((sum, p) => sum + p.paidAmount, 0),
  };

  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const overdueProjects = projects.filter(
    (p) => p.status !== "Completed" && new Date(p.deadline) < new Date(),
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
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back — here's your agency overview.
        </p>
      </div>

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
      </div>

      {overdueProjects.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {overdueProjects.length} overdue{" "}
              {overdueProjects.length === 1 ? "project" : "projects"}
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              {overdueProjects.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
            Recent Projects
          </h2>
          {recentProjects.length === 0 ? (
            <Card
              className="text-center py-8"
              data-ocid="dashboard.projects.empty_state"
            >
              <FolderOpen className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No projects yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project, i) => {
                const client = clients.find((c) => c.id === project.clientId);
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
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client?.name ?? "Unknown client"}
                        </p>
                      </div>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock className="size-3.5" /> Upcoming Deadlines (7 days)
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <Card className="text-center py-8">
              <CheckCircle2 className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((project, i) => {
                const daysLeft = Math.ceil(
                  (new Date(project.deadline).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
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
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 flex-shrink-0">
                        {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                      </span>
                    </div>
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
