import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useLocalData } from "@/hooks/useLocalData";
import { formatCurrency } from "@/types";
import type { Expense } from "@/types";
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  PlusCircle,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Category config ─────────────────────────────────────────────────────────

const CATEGORIES = [
  "Software",
  "Marketing",
  "Salaries",
  "Office",
  "Travel",
  "Equipment",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<
  Category | string,
  { bg: string; text: string; dot: string }
> = {
  Software: { bg: "bg-violet-100", text: "text-violet-700", dot: "#7c3aed" },
  Marketing: { bg: "bg-sky-100", text: "text-sky-700", dot: "#0284c7" },
  Salaries: { bg: "bg-amber-100", text: "text-amber-700", dot: "#d97706" },
  Office: { bg: "bg-teal-100", text: "text-teal-700", dot: "#0f766e" },
  Travel: { bg: "bg-orange-100", text: "text-orange-700", dot: "#ea580c" },
  Equipment: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "#4338ca" },
  Other: { bg: "bg-muted", text: "text-muted-foreground", dot: "#94a3b8" },
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span
        className="size-1.5 rounded-full flex-shrink-0"
        style={{ background: style.dot }}
      />
      {category}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Display finance amounts in INR (default; expenses have no per-record currency)
function fmt(n: number) {
  return formatCurrency(n, "INR");
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
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
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
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
            {fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  amount: "",
  date: todayISO(),
  category: "Software" as Category,
};

export function FinancePage() {
  const { projects, expenses, financeStats, addExpense, deleteExpense } =
    useLocalData();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [success, setSuccess] = useState(false);

  // ── Chart data: last 6 months ──────────────────────────────────────────────

  const chartData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const label = format(monthDate, "MMM");
      const start = startOfMonth(monthDate).getTime();
      const end = endOfMonth(monthDate).getTime();

      const income = projects.reduce((sum, p) => {
        const ts = p.createdAt;
        return ts >= start && ts <= end ? sum + p.paidAmount : sum;
      }, 0);

      const expense = expenses.reduce((sum, e) => {
        const ts = parseISO(e.date).getTime();
        return ts >= start && ts <= end ? sum + e.amount : sum;
      }, 0);

      return { month: label, Income: income, Expense: expense };
    });
  })();

  // ── Form validation & submit ───────────────────────────────────────────────

  function validate() {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.amount || Number(form.amount) <= 0)
      errs.amount = "Amount must be greater than 0";
    if (!form.date) errs.date = "Date is required";
    if (!form.category) errs.category = "Category is required" as Category;
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      title: form.title.trim(),
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      createdAt: Date.now(),
    };

    addExpense(expense);
    setForm({ ...EMPTY_FORM, date: todayISO() });
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  // ── Sorted expenses list ───────────────────────────────────────────────────

  const sortedExpenses = [...expenses].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
  );

  const isProfit = financeStats.netProfit >= 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0" data-ocid="finance.page">
      {/* ── Premium Gradient Hero Header ─────────────────────────────────── */}
      <div
        className="gradient-header px-6 py-8 md:py-10"
        data-ocid="finance.hero.section"
      >
        <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
          Financial Overview
        </p>
        <h1 className="text-3xl font-display font-bold text-white leading-tight">
          Finance
        </h1>
        <p className="text-indigo-200/80 mt-1 text-sm">
          Track income, expenses, and your agency's&nbsp;
          <span
            className={`font-semibold ${isProfit ? "text-emerald-300" : "text-rose-300"}`}
          >
            net profit: {isProfit ? "+" : ""}
            {fmt(financeStats.netProfit)}
          </span>
        </p>

        {/* Hero inline metrics */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Total Income
            </p>
            <p className="text-2xl font-display font-bold text-emerald-300 mt-0.5">
              {fmt(financeStats.totalIncome)}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Total Expenses
            </p>
            <p className="text-2xl font-display font-bold text-rose-300 mt-0.5">
              {fmt(financeStats.totalExpenses)}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Net Profit
            </p>
            <p
              className={`text-2xl font-display font-bold mt-0.5 ${isProfit ? "text-emerald-300" : "text-rose-300"}`}
            >
              {isProfit ? "+" : ""}
              {fmt(financeStats.netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-8">
        {/* Summary Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          data-ocid="finance.stats.section"
        >
          {/* Income card — green tinted */}
          <Card hoverable>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total Income
                </p>
                <p className="text-2xl font-display font-bold text-emerald-600 mt-1.5">
                  {fmt(financeStats.totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpCircle className="size-3 text-emerald-500" />
                  Revenue from projects
                </p>
              </div>
              <div className="size-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{
                  width:
                    financeStats.totalIncome > 0
                      ? `${Math.min(100, (financeStats.totalIncome / Math.max(financeStats.totalIncome, financeStats.totalExpenses)) * 100)}%`
                      : "0%",
                }}
              />
            </div>
          </Card>

          {/* Expense card — red tinted */}
          <Card hoverable>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total Expenses
                </p>
                <p className="text-2xl font-display font-bold text-rose-600 mt-1.5">
                  {fmt(financeStats.totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowDownCircle className="size-3 text-rose-500" />
                  All logged expenses
                </p>
              </div>
              <div className="size-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-100">
                <TrendingDown className="size-5 text-rose-600" />
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
                style={{
                  width:
                    financeStats.totalExpenses > 0
                      ? `${Math.min(100, (financeStats.totalExpenses / Math.max(financeStats.totalIncome, financeStats.totalExpenses)) * 100)}%`
                      : "0%",
                }}
              />
            </div>
          </Card>

          {/* Net Profit — premium gradient card */}
          <Card variant="premium" hoverable>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Net Profit
                </p>
                <p
                  className={`text-2xl font-display font-bold mt-1.5 ${
                    isProfit ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isProfit ? "+" : ""}
                  {fmt(financeStats.netProfit)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {isProfit ? (
                    <ArrowUpCircle className="size-3 text-emerald-500" />
                  ) : (
                    <ArrowDownCircle className="size-3 text-rose-500" />
                  )}
                  {isProfit ? "Profitable" : "Net loss this period"}
                </p>
              </div>
              <div
                className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isProfit ? "bg-emerald-100" : "bg-rose-100"}`}
              >
                <DollarSign
                  className={`size-5 ${isProfit ? "text-emerald-600" : "text-rose-600"}`}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Main grid: chart + form */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Chart — spans 3 cols */}
          <div className="md:col-span-3" data-ocid="finance.chart.section">
            <Card>
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Revenue vs Expenses — Last 6 Months
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <defs>
                    <linearGradient
                      id="finGradIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#4338ca"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="finGradExpense"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#e11d48"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    width={44}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "0.8rem", paddingTop: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="Income"
                    fill="url(#finGradIncome)"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="Expense"
                    fill="url(#finGradExpense)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Add Expense Form — spans 2 cols */}
          <div
            className="md:col-span-2"
            data-ocid="finance.add_expense.section"
          >
            <Card>
              <h2 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="size-3.5 text-primary" />
                </div>
                Add Expense
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Title */}
                <div>
                  <label
                    htmlFor="expense-title"
                    className="block text-xs font-semibold text-foreground mb-1.5"
                  >
                    Title
                  </label>
                  <input
                    id="expense-title"
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Adobe Creative Suite"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                    data-ocid="finance.expense_title.input"
                  />
                  {errors.title && (
                    <p
                      className="text-xs text-rose-600 mt-1"
                      data-ocid="finance.expense_title.field_error"
                    >
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="expense-amount"
                    className="block text-xs font-semibold text-foreground mb-1.5"
                  >
                    Amount (₹ INR)
                  </label>
                  <input
                    id="expense-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                    data-ocid="finance.expense_amount.input"
                  />
                  {errors.amount && (
                    <p
                      className="text-xs text-rose-600 mt-1"
                      data-ocid="finance.expense_amount.field_error"
                    >
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Date + Category row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="expense-date"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Date
                    </label>
                    <input
                      id="expense-date"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                      data-ocid="finance.expense_date.input"
                    />
                    {errors.date && (
                      <p
                        className="text-xs text-rose-600 mt-1"
                        data-ocid="finance.expense_date.field_error"
                      >
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="expense-category"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Category
                    </label>
                    <select
                      id="expense-category"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value as Category,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                      data-ocid="finance.expense_category.select"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring gradient-primary"
                  data-ocid="finance.add_expense.submit_button"
                >
                  Add Expense
                </button>

                {/* Success feedback */}
                {success && (
                  <p
                    className="text-xs text-emerald-600 font-medium text-center flex items-center justify-center gap-1"
                    data-ocid="finance.add_expense.success_state"
                  >
                    <span className="size-3.5 rounded-full bg-emerald-100 flex items-center justify-center">
                      ✓
                    </span>
                    Expense added successfully
                  </p>
                )}
              </form>
            </Card>
          </div>
        </div>

        {/* Expense List */}
        <div data-ocid="finance.expenses.section">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
            All Expenses
          </h2>

          {sortedExpenses.length === 0 ? (
            <Card data-ocid="finance.expenses.empty_state">
              <EmptyState
                icon={Receipt}
                title="No expenses tracked"
                description="Start tracking your expenses to see insights and keep your finances in check."
                size="md"
              />
            </Card>
          ) : (
            <Card className="!p-0 overflow-hidden">
              <div className="divide-y divide-border">
                {sortedExpenses.map((exp, i) => (
                  <div
                    key={exp.id}
                    className="group flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors"
                    data-ocid={`finance.expense.item.${i + 1}`}
                  >
                    {/* Left: category dot + title + meta */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${(CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.Other).dot}15`,
                        }}
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            background: (
                              CATEGORY_COLORS[exp.category] ??
                              CATEGORY_COLORS.Other
                            ).dot,
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {exp.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <CategoryBadge category={exp.category} />
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(exp.date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: amount + delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-rose-600">
                        -{fmt(exp.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteExpense(exp.id)}
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:opacity-100"
                        aria-label={`Delete expense: ${exp.title}`}
                        data-ocid={`finance.expense.delete_button.${i + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer totals */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border rounded-b-xl">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Expenses
                </span>
                <span className="text-sm font-bold text-rose-600">
                  -{fmt(financeStats.totalExpenses)}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
