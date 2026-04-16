export type ProjectStatus = "Pending" | "InProgress" | "Completed";
export type PaymentStatus = "Paid" | "Partial" | "Unpaid";
export type DeadlineStatus = "Overdue" | "Upcoming" | "Normal";
export type CurrencyType = "INR" | "USD";

// ---------------------------------------------------------------------------
// Lead Management
// ---------------------------------------------------------------------------

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "ProposalSent"
  | "Converted"
  | "Lost";

export type LeadSource =
  | "Instagram"
  | "WhatsApp"
  | "Referral"
  | "Facebook"
  | "LinkedIn"
  | "Website"
  | "Other";

export interface ActivityEntry {
  id: string;
  type: "Call" | "Message" | "Meeting";
  notes: string;
  timestamp: string; // ISO string
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  followUpDate: string | null;
  activityLog: ActivityEntry[];
  createdAt: string; // ISO string
  archivedAt: string | null; // ISO string, null = active
}

export interface ImportedLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  quality: "High" | "Medium" | "Low";
  importStatus: "Pending" | "Approved" | "Rejected";
  isDuplicate: boolean;
}

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
  budgetCurrency: CurrencyType; // defaults to 'INR' for backward compat
  paidAmount: number;
  paidCurrency: CurrencyType; // defaults to 'INR' for backward compat
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
  lastActivityAt?: number; // timestamp (ms), updated on save/project changes
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

/**
 * Format a currency amount with the appropriate symbol and thousands separators.
 * Examples: formatCurrency(8000, 'INR') → '₹ 8,000'
 *           formatCurrency(500, 'USD')  → '$ 500'
 */
export function formatCurrency(amount: number, currency: CurrencyType): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const formatted = Math.abs(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  return `${symbol} ${formatted}`;
}

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
