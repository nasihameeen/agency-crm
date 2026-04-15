import { Card } from "@/components/Card";
import { useLocalData } from "@/hooks/useLocalData";
import { getDeadlineStatus, getPaymentStatus } from "@/types";
import type { Expense, Project } from "@/types";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMonthKey(dateStr: string | number): string {
  const d = typeof dateStr === "number" ? new Date(dateStr) : new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getLast6MonthKeys(): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTH_NAMES[d.getMonth()],
    });
  }
  return result;
}

function buildRevenueExpenseData(projects: Project[], expenses: Expense[]) {
  const months = getLast6MonthKeys();

  // Revenue: sum of paidAmount grouped by project createdAt month
  const revenueByMonth: Record<string, number> = {};
  for (const p of projects) {
    if (p.paidAmount > 0) {
      const key = getMonthKey(p.createdAt);
      revenueByMonth[key] = (revenueByMonth[key] ?? 0) + p.paidAmount;
    }
  }

  // Expenses: sum grouped by expense date month
  const expenseByMonth: Record<string, number> = {};
  for (const e of expenses) {
    const key = getMonthKey(e.date);
    expenseByMonth[key] = (expenseByMonth[key] ?? 0) + e.amount;
  }

  return months.map(({ key, label }) => ({
    month: label,
    Revenue: revenueByMonth[key] ?? 0,
    Expenses: expenseByMonth[key] ?? 0,
  }));
}

function buildStatusData(projects: Project[]) {
  const pending = projects.filter((p) => p.status === "Pending").length;
  const inProgress = projects.filter((p) => p.status === "InProgress").length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  return [
    { name: "Pending", value: pending, color: "#94a3b8" },
    { name: "In Progress", value: inProgress, color: "#f59e0b" },
    { name: "Completed", value: completed, color: "#22c55e" },
  ].filter((d) => d.value > 0);
}

function buildPaymentData(projects: Project[]) {
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;

  for (const p of projects) {
    const status = getPaymentStatus(p.budget, p.paidAmount);
    if (status === "Paid") {
      paidCount++;
      paidAmount += p.paidAmount;
    } else if (status === "Partial") {
      partialCount++;
      paidAmount += p.paidAmount;
      unpaidAmount += p.budget - p.paidAmount;
    } else {
      unpaidCount++;
      unpaidAmount += p.budget;
    }
  }

  return {
    counts: [
      { name: "Paid", value: paidCount },
      { name: "Partial", value: partialCount },
      { name: "Unpaid", value: unpaidCount },
    ],
    amounts: [
      { name: "Collected", Collected: paidAmount },
      { name: "Outstanding", Outstanding: unpaidAmount },
    ],
    paidAmount,
    unpaidAmount,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  accent?: "green" | "red" | "yellow" | "blue" | "default";
}

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "default",
}: MetricCardProps) {
  const styles: Record<string, { icon: string; value: string }> = {
    green: {
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
    },
    red: { icon: "bg-rose-100 text-rose-600", value: "text-rose-700" },
    yellow: { icon: "bg-amber-100 text-amber-600", value: "text-amber-700" },
    blue: { icon: "bg-sky-100 text-sky-600", value: "text-sky-700" },
    default: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  };
  const s = styles[accent];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className={`text-2xl font-display font-bold mt-1 ${s.value}`}>
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

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        {title}
      </h2>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// Custom tooltip for recharts
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((item) => (
        <p
          key={item.name}
          style={{ color: item.color }}
          className="font-medium"
        >
          {item.name}:{" "}
          {currency ? `$${item.value.toLocaleString()}` : item.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function AnalyticsPage() {
  const { projects, expenses, financeStats } = useLocalData();

  const totalRevenue = financeStats.totalIncome;
  const totalExpenses = financeStats.totalExpenses;
  const netProfit = financeStats.netProfit;
  const activeProjects = projects.filter(
    (p) => p.status === "InProgress",
  ).length;
  const overdueProjects = projects.filter(
    (p) =>
      p.status !== "Completed" && getDeadlineStatus(p.deadline) === "Overdue",
  ).length;

  const revenueExpenseData = buildRevenueExpenseData(projects, expenses);
  const statusData = buildStatusData(projects);
  const paymentData = buildPaymentData(projects);

  const hasProjects = projects.length > 0;

  return (
    <div className="p-6 space-y-10" data-ocid="analytics.page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Agency performance overview — revenue, expenses, and project health.
        </p>
      </div>

      {/* Top Metric Cards */}
      <section data-ocid="analytics.metrics.section">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            accent="green"
            sub="Collected from projects"
          />
          <MetricCard
            label="Total Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            icon={TrendingDown}
            accent="red"
            sub="All logged expenses"
          />
          <MetricCard
            label="Net Profit"
            value={`${netProfit >= 0 ? "+" : ""}$${netProfit.toLocaleString()}`}
            icon={TrendingUp}
            accent={netProfit >= 0 ? "green" : "red"}
            sub={netProfit >= 0 ? "Profitable" : "Net loss"}
          />
          <MetricCard
            label="Active Projects"
            value={String(activeProjects)}
            icon={Activity}
            accent="blue"
            sub="Currently in progress"
          />
          <MetricCard
            label="Overdue Projects"
            value={String(overdueProjects)}
            icon={AlertTriangle}
            accent={overdueProjects > 0 ? "red" : "default"}
            sub={overdueProjects === 0 ? "All on track" : "Need attention"}
          />
        </div>
      </section>

      {/* Charts Section */}
      {!hasProjects ? (
        <Card
          className="text-center py-16"
          data-ocid="analytics.charts.empty_state"
        >
          <Activity className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add clients and projects to see analytics charts.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Chart 1: Revenue vs Expenses Monthly */}
          <section data-ocid="analytics.revenue_expense.section">
            <SectionHeader
              title="Revenue vs Expenses"
              sub="Monthly breakdown over the last 6 months"
            />
            <Card>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={revenueExpenseData}
                  barCategoryGap="30%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <Tooltip content={<ChartTooltip currency />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Expenses"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </section>

          {/* Chart 2 + 3 side by side on large screens */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chart 2: Project Status Distribution */}
            <section data-ocid="analytics.status.section">
              <SectionHeader
                title="Project Status Distribution"
                sub="Breakdown by current status"
              />
              <Card>
                {statusData.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No projects found
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          value,
                          name,
                        ]}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                        iconType="circle"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </section>

            {/* Chart 3: Payment Insights */}
            <section data-ocid="analytics.payment.section">
              <SectionHeader
                title="Payment Insights"
                sub="Collected vs outstanding amounts"
              />
              <Card>
                <div className="space-y-4">
                  {/* Amount bars */}
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={[
                        {
                          name: "Financials",
                          Collected: paymentData.paidAmount,
                          Outstanding: paymentData.unpaidAmount,
                        },
                      ]}
                      layout="vertical"
                      barCategoryGap="30%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                        }
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={false}
                        axisLine={false}
                        tickLine={false}
                        width={0}
                      />
                      <Tooltip content={<ChartTooltip currency />} />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar
                        dataKey="Collected"
                        fill="#22c55e"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="Outstanding"
                        fill="#f43f5e"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Project count pills */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    {paymentData.counts.map((item) => {
                      const color =
                        item.name === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.name === "Partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700";
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
                        >
                          <span>{item.value}</span>
                          <span>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
