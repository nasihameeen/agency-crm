import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { StatBadge } from "@/components/StatBadge";
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
  const revenueByMonth: Record<string, number> = {};
  for (const p of projects) {
    if (p.paidAmount > 0) {
      const key = getMonthKey(p.createdAt);
      revenueByMonth[key] = (revenueByMonth[key] ?? 0) + p.paidAmount;
    }
  }
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
  accent?: "green" | "red" | "yellow" | "blue" | "orange" | "default";
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  isPremium?: boolean;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "default",
  trend,
  trendLabel,
  isPremium = false,
}: MetricCardProps) {
  const styles: Record<
    string,
    { iconBg: string; iconText: string; value: string }
  > = {
    green: {
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      value: "text-emerald-700",
    },
    red: {
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
      value: "text-rose-700",
    },
    yellow: {
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      value: "text-amber-700",
    },
    blue: {
      iconBg: "bg-sky-100",
      iconText: "text-sky-600",
      value: "text-sky-700",
    },
    orange: {
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      value: "text-orange-700",
    },
    default: {
      iconBg: "bg-primary/10",
      iconText: "text-primary",
      value: "text-foreground",
    },
  };
  const s = styles[accent];
  const badgeVariant =
    trend === "up" ? "green" : trend === "down" ? "red" : "neutral";
  const badgeLabel =
    trendLabel ??
    (trend === "up" ? "↑ Growing" : trend === "down" ? "↓ Declining" : "—");

  return (
    <Card variant={isPremium ? "premium" : "default"} hoverable>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-display font-bold mt-1.5 ${s.value}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend && trendLabel && (
            <div className="mt-2">
              <StatBadge label={badgeLabel} variant={badgeVariant} dot />
            </div>
          )}
        </div>
        <div
          className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}
        >
          <Icon className={`size-5 ${s.iconText}`} />
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
    <div className="bg-card border border-border rounded-xl shadow-elevated px-4 py-3 text-xs min-w-[140px]">
      {label && (
        <p className="font-bold text-foreground mb-2 text-sm">{label}</p>
      )}
      {payload.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-muted-foreground font-medium">
              {item.name}
            </span>
          </span>
          <span className="font-bold" style={{ color: item.color }}>
            {currency ? `$${item.value.toLocaleString()}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Gradient bar fill for recharts — uses SVG defs
function GradientDefs() {
  return (
    <defs>
      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#4338ca" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="gradCollected" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="gradOutstanding" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.7} />
      </linearGradient>
    </defs>
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
    <div className="space-y-0" data-ocid="analytics.page">
      {/* ── Premium Gradient Hero Header ────────────────────────────────────── */}
      <div
        className="gradient-header px-6 py-8 md:py-10"
        data-ocid="analytics.hero.section"
      >
        <div className="max-w-full">
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
            Agency Overview
          </p>
          <h1 className="text-3xl font-display font-bold text-white leading-tight">
            Analytics
          </h1>
          <p className="text-indigo-200/80 mt-1 text-sm">
            Agency performance at a glance
          </p>

          {/* Inline hero metrics */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-2xl font-display font-bold text-white mt-0.5">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
                Net Profit
              </p>
              <p
                className={`text-2xl font-display font-bold mt-0.5 ${
                  netProfit >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
                Active Projects
              </p>
              <p className="text-2xl font-display font-bold text-sky-300 mt-0.5">
                {activeProjects}
              </p>
            </div>
            {overdueProjects > 0 && (
              <>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
                    Overdue
                  </p>
                  <p className="text-2xl font-display font-bold text-rose-300 mt-0.5">
                    {overdueProjects}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-8">
        {/* Top Metric Cards */}
        <section data-ocid="analytics.metrics.section">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              label="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              accent="green"
              sub="Collected from projects"
              trend={totalRevenue > 0 ? "up" : "neutral"}
              trendLabel={totalRevenue > 0 ? "↑ Active" : "No data"}
            />
            <MetricCard
              label="Total Expenses"
              value={`$${totalExpenses.toLocaleString()}`}
              icon={TrendingDown}
              accent="red"
              sub="All logged expenses"
              trend={totalExpenses > 0 ? "down" : "neutral"}
              trendLabel={totalExpenses > 0 ? "↓ Outflow" : "No expenses"}
            />
            <MetricCard
              label="Net Profit"
              value={`${netProfit >= 0 ? "+" : ""}$${netProfit.toLocaleString()}`}
              icon={TrendingUp}
              accent={netProfit >= 0 ? "green" : "red"}
              sub={netProfit >= 0 ? "Profitable" : "Net loss"}
              trend={netProfit >= 0 ? "up" : "down"}
              trendLabel={netProfit >= 0 ? "↑ Profitable" : "↓ Net loss"}
              isPremium
            />
            <MetricCard
              label="Active Projects"
              value={String(activeProjects)}
              icon={Activity}
              accent="blue"
              sub="Currently in progress"
              trend={activeProjects > 0 ? "up" : "neutral"}
              trendLabel={activeProjects > 0 ? "↑ In progress" : "None active"}
            />
            <MetricCard
              label="Overdue Projects"
              value={String(overdueProjects)}
              icon={AlertTriangle}
              accent={overdueProjects > 0 ? "orange" : "default"}
              sub={overdueProjects === 0 ? "All on track" : "Need attention"}
              trend={overdueProjects > 0 ? "down" : "neutral"}
              trendLabel={overdueProjects > 0 ? "↓ Action needed" : "On track"}
            />
          </div>
        </section>

        {/* Charts Section */}
        {!hasProjects ? (
          <Card data-ocid="analytics.charts.empty_state">
            <EmptyState
              icon={Activity}
              title="No data yet"
              description="Add clients and projects to see analytics charts and insights."
              size="md"
            />
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
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart
                    data={revenueExpenseData}
                    barCategoryGap="30%"
                    barGap={4}
                  >
                    <GradientDefs />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0.005 250)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "oklch(0.52 0.012 245)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "oklch(0.52 0.012 245)" }}
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
                    <Bar
                      dataKey="Revenue"
                      fill="url(#gradRevenue)"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="Expenses"
                      fill="url(#gradExpenses)"
                      radius={[5, 5, 0, 0]}
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
                          outerRadius={92}
                          innerRadius={52}
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
                            background: "var(--card)",
                            border: "1px solid oklch(0.91 0.006 250)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "var(--card-foreground)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
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
                        <defs>
                          <linearGradient
                            id="gradCol"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="#16a34a"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#22c55e"
                              stopOpacity={0.9}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradOuts"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="#e11d48"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#f43f5e"
                              stopOpacity={0.9}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.92 0.005 250)"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: "oklch(0.52 0.012 245)" }}
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
                          fill="url(#gradCol)"
                          radius={[0, 5, 5, 0]}
                        />
                        <Bar
                          dataKey="Outstanding"
                          fill="url(#gradOuts)"
                          radius={[0, 5, 5, 0]}
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
    </div>
  );
}
