import { Card } from "@/components/Card";
import { useLocalData } from "@/hooks/useLocalData";
import type { Expense } from "@/types";
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  DollarSign,
  PlusCircle,
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

const CATEGORY_COLORS: Record<Category | string, { bg: string; text: string }> =
  {
    Software: { bg: "bg-violet-100", text: "text-violet-700" },
    Marketing: { bg: "bg-sky-100", text: "text-sky-700" },
    Salaries: { bg: "bg-amber-100", text: "text-amber-700" },
    Office: { bg: "bg-teal-100", text: "text-teal-700" },
    Travel: { bg: "bg-orange-100", text: "text-orange-700" },
    Equipment: { bg: "bg-indigo-100", text: "text-indigo-700" },
    Other: { bg: "bg-muted", text: "text-muted-foreground" },
  };

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {category}
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

interface FinanceStatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "green" | "red" | "auto";
  isPositive?: boolean;
}

function FinanceStatCard({
  label,
  value,
  icon: Icon,
  variant,
  isPositive,
}: FinanceStatCardProps) {
  const colorMap = {
    green: {
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
    },
    red: { icon: "bg-rose-100 text-rose-600", value: "text-rose-700" },
    auto: isPositive
      ? { icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" }
      : { icon: "bg-rose-100 text-rose-600", value: "text-rose-700" },
  };
  const c = colorMap[variant];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className={`text-2xl font-display font-bold mt-1 ${c.value}`}>
            {value}
          </p>
        </div>
        <div
          className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8" data-ocid="finance.page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Finance
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track income, expenses, and your agency's net profit.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="finance.stats.section"
      >
        <FinanceStatCard
          label="Total Income"
          value={fmt(financeStats.totalIncome)}
          icon={TrendingUp}
          variant="green"
        />
        <FinanceStatCard
          label="Total Expenses"
          value={fmt(financeStats.totalExpenses)}
          icon={TrendingDown}
          variant="red"
        />
        <FinanceStatCard
          label="Net Profit"
          value={fmt(financeStats.netProfit)}
          icon={DollarSign}
          variant="auto"
          isPositive={financeStats.netProfit >= 0}
        />
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.9 0.008 230)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "oklch(0.5 0.012 230)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "oklch(0.5 0.012 230)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  width={44}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    fmt(value),
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid oklch(0.9 0.008 230)",
                    fontSize: "0.8rem",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.8rem", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="Income"
                  fill="oklch(0.6 0.15 150)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Expense"
                  fill="oklch(0.55 0.22 25)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Add Expense Form — spans 2 cols */}
        <div className="md:col-span-2" data-ocid="finance.add_expense.section">
          <Card>
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="size-3.5" />
              Add Expense
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Title */}
              <div>
                <label
                  htmlFor="expense-title"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Title
                </label>
                <input
                  id="expense-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Adobe Creative Suite"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
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
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Amount ($)
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
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

              {/* Date */}
              <div>
                <label
                  htmlFor="expense-date"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
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

              {/* Category */}
              <div>
                <label
                  htmlFor="expense-category"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Category
                </label>
                <select
                  id="expense-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as Category })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  data-ocid="finance.expense_category.select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                data-ocid="finance.add_expense.submit_button"
              >
                Add Expense
              </button>

              {/* Success feedback */}
              {success && (
                <p
                  className="text-xs text-emerald-600 font-medium text-center"
                  data-ocid="finance.add_expense.success_state"
                >
                  ✓ Expense added successfully
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
          <Card
            className="text-center py-12"
            data-ocid="finance.expenses.empty_state"
          >
            <TrendingDown className="size-9 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              No expenses yet
            </p>
            <p className="text-xs text-muted-foreground">
              Add your first expense using the form above.
            </p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {sortedExpenses.map((exp, i) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  data-ocid={`finance.expense.item.${i + 1}`}
                >
                  {/* Left: title + meta */}
                  <div className="min-w-0 flex-1">
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

                  {/* Right: amount + delete */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-rose-600">
                      -{fmt(exp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
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
  );
}
