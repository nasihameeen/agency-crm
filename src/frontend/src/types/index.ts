export type ProjectStatus = "Pending" | "InProgress" | "Completed";
export type PaymentStatus = "Paid" | "Partial" | "Unpaid";
export type DeadlineStatus = "Overdue" | "Upcoming" | "Normal";

export interface Task {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
  date?: string; // ISO date string (optional for backwards compat)
  priority?: "low" | "medium" | "high"; // optional for backwards compat
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface FileLink {
  id: string;
  label: string;
  url: string;
  createdAt: number;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  budget: number;
  paidAmount: number;
  deadline: string; // ISO date string
  status: ProjectStatus;
  tasks: Task[];
  notes: Note[];
  links: FileLink[];
  createdAt: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  notes: Note[];
  createdAt: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO date string
  category: string; // e.g., 'Software', 'Marketing', 'Salaries', 'Office', 'Other'
  createdAt: number;
}

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  overdueProjects: number;
  pendingPaymentsTotal: number;
  tasksCompletedPercent: number;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Derive payment status from budget and amount paid. */
export function getPaymentStatus(
  budget: number,
  paidAmount: number,
): PaymentStatus {
  if (paidAmount <= 0) return "Unpaid";
  if (paidAmount >= budget) return "Paid";
  return "Partial";
}

/**
 * Derive deadline status.
 * - Overdue  → deadline is in the past
 * - Upcoming → deadline is within the next 2 days (≤ 48 h)
 * - Normal   → everything else (or no deadline set)
 */
export function getDeadlineStatus(
  deadline: string | undefined,
): DeadlineStatus {
  if (!deadline) return "Normal";

  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const diffMs = deadlineMs - now;

  if (diffMs < 0) return "Overdue";
  if (diffMs <= 2 * 24 * 60 * 60 * 1000) return "Upcoming";
  return "Normal";
}

/**
 * Compute task completion stats for a project's task list.
 * Returns done count, total count, and completion percentage (0–100).
 */
export function getTaskProgress(tasks: Task[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = tasks.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = tasks.filter((t) => t.done).length;
  const percent = Math.round((done / total) * 1000) / 10; // 1 decimal
  return { done, total, percent };
}
