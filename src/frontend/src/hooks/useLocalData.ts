import type {
  ActivityEntry,
  Client,
  Expense,
  FinanceStats,
  Lead,
  Project,
} from "@/types";
import { getDeadlineStatus } from "@/types";
import { useCallback, useState } from "react";

const CLIENTS_KEY = "agency_crm_clients";
const PROJECTS_KEY = "agency_crm_projects";
const EXPENSES_KEY = "agency_crm_expenses";
const LEADS_KEY = "agency_crm_leads";

const SAMPLE_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Samantha Cole",
    phone: "+1 (555) 871-2234",
    email: "sam@colecreative.co",
    companyName: "Cole Creative",
    source: "Instagram",
    status: "Interested",
    notes: "Looking for a full brand package. Budget seems strong.",
    followUpDate: new Date(Date.now() + 2 * 86400000)
      .toISOString()
      .split("T")[0],
    activityLog: [
      {
        id: "al-1",
        type: "Call",
        notes: "Intro call — discussed branding needs and timeline.",
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    archivedAt: null,
  },
  {
    id: "lead-2",
    name: "Marcus Webb",
    phone: "+1 (555) 443-9901",
    email: "marcus@webbuilt.io",
    companyName: "WebBuilt Agency",
    source: "Referral",
    status: "ProposalSent",
    notes: "Referred by Alex Rivera. Needs e-commerce site overhaul.",
    followUpDate: new Date(Date.now() - 1 * 86400000)
      .toISOString()
      .split("T")[0],
    activityLog: [
      {
        id: "al-2",
        type: "Meeting",
        notes: "Discovery meeting. Shared initial scope and timeline.",
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "al-3",
        type: "Message",
        notes: "Sent proposal PDF via email.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    archivedAt: null,
  },
  {
    id: "lead-3",
    name: "Lena Park",
    phone: "+1 (555) 602-1177",
    email: "lena@parkblooms.com",
    companyName: "Park Blooms",
    source: "LinkedIn",
    status: "New",
    notes: "Reached out about social media management.",
    followUpDate: null,
    activityLog: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    archivedAt: null,
  },
];

const SAMPLE_CLIENTS: Client[] = [
  {
    id: "client-1",
    name: "Alex Rivera",
    phone: "+1 (555) 201-4891",
    email: "alex@bluewave.io",
    businessName: "Bluewave Digital",
    notes: [
      {
        id: "n1",
        content: "Prefers communication via email. Bi-weekly progress calls.",
        createdAt: Date.now() - 86400000,
      },
    ],
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: "client-2",
    name: "Priya Nair",
    phone: "+1 (555) 312-7744",
    email: "priya@novabrand.co",
    businessName: "Nova Brand Studio",
    notes: [],
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: "client-3",
    name: "Jordan Malik",
    phone: "+1 (555) 488-0033",
    email: "jordan@peakops.com",
    businessName: "PeakOps Inc.",
    notes: [],
    createdAt: Date.now() - 10 * 86400000,
  },
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "proj-1",
    clientId: "client-1",
    name: "Brand Identity Redesign",
    description:
      "Complete visual identity overhaul including logo, color palette, typography, and brand guidelines.",
    budget: 8000,
    paidAmount: 4000,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "InProgress",
    tasks: [
      {
        id: "t1",
        name: "Discovery & research",
        done: true,
        createdAt: Date.now() - 10 * 86400000,
      },
      {
        id: "t2",
        name: "Logo concepts (3 options)",
        done: true,
        createdAt: Date.now() - 8 * 86400000,
      },
      {
        id: "t3",
        name: "Color palette finalization",
        done: false,
        createdAt: Date.now() - 5 * 86400000,
      },
      {
        id: "t4",
        name: "Brand guidelines document",
        done: false,
        createdAt: Date.now() - 2 * 86400000,
      },
    ],
    notes: [
      {
        id: "n1",
        content:
          "Client approved logo direction B. Proceeding with teal and navy palette.",
        createdAt: Date.now() - 3 * 86400000,
      },
    ],
    links: [
      {
        id: "l1",
        label: "Design Files (Figma)",
        url: "https://figma.com",
        createdAt: Date.now() - 7 * 86400000,
      },
    ],
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: "proj-2",
    clientId: "client-2",
    name: "E-commerce Website",
    description:
      "Full-stack e-commerce platform with product management, checkout, and admin dashboard.",
    budget: 15000,
    paidAmount: 15000,
    deadline: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    status: "Completed",
    tasks: [
      {
        id: "t5",
        name: "Wireframes approved",
        done: true,
        createdAt: Date.now() - 20 * 86400000,
      },
      {
        id: "t6",
        name: "Frontend development",
        done: true,
        createdAt: Date.now() - 15 * 86400000,
      },
      {
        id: "t7",
        name: "Payment integration",
        done: true,
        createdAt: Date.now() - 8 * 86400000,
      },
      {
        id: "t8",
        name: "QA & launch",
        done: true,
        createdAt: Date.now() - 5 * 86400000,
      },
    ],
    notes: [],
    links: [
      {
        id: "l2",
        label: "Live Site",
        url: "https://novabrand.co",
        createdAt: Date.now() - 5 * 86400000,
      },
    ],
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: "proj-3",
    clientId: "client-3",
    name: "SEO Content Strategy",
    description:
      "3-month SEO content plan with keyword research, blog posts, and backlink strategy.",
    budget: 4500,
    paidAmount: 0,
    deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    status: "Pending",
    tasks: [
      {
        id: "t9",
        name: "Keyword research report",
        done: false,
        createdAt: Date.now() - 1 * 86400000,
      },
      {
        id: "t10",
        name: "Content calendar draft",
        done: false,
        createdAt: Date.now() - 1 * 86400000,
      },
    ],
    notes: [],
    links: [],
    createdAt: Date.now() - 2 * 86400000,
  },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/** Compute dashboard stats from current clients and projects lists. */
function computeStats(clients: Client[], projects: Project[]) {
  const activeProjects = projects.filter(
    (p) => p.status !== "Completed",
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed",
  ).length;
  const totalEarnings = projects.reduce((sum, p) => sum + p.paidAmount, 0);

  // Overdue: deadline passed AND not yet completed
  const overdueProjects = projects.filter(
    (p) =>
      p.status !== "Completed" && getDeadlineStatus(p.deadline) === "Overdue",
  ).length;

  // Pending payments: sum of remaining balances on non-completed projects
  const pendingPaymentsTotal = projects
    .filter((p) => p.status !== "Completed")
    .reduce((sum, p) => sum + Math.max(0, p.budget - p.paidAmount), 0);

  // Tasks completed %: across ALL projects
  let totalTasks = 0;
  let doneTasks = 0;
  for (const p of projects) {
    totalTasks += p.tasks.length;
    doneTasks += p.tasks.filter((t) => t.done).length;
  }
  const tasksCompletedPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 1000) / 10; // 1 decimal

  return {
    totalClients: clients.length,
    activeProjects,
    completedProjects,
    totalEarnings,
    overdueProjects,
    pendingPaymentsTotal,
    tasksCompletedPercent,
  };
}

/** Compute finance stats from projects (income) and expenses. */
function computeFinanceStats(
  projects: Project[],
  expenses: Expense[],
): FinanceStats {
  const totalIncome = projects.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
  };
}

export function useLocalData() {
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromStorage(CLIENTS_KEY, SAMPLE_CLIENTS),
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage(PROJECTS_KEY, SAMPLE_PROJECTS),
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage(EXPENSES_KEY, [] as Expense[]),
  );
  const [leads, setLeads] = useState<Lead[]>(() =>
    loadFromStorage(LEADS_KEY, SAMPLE_LEADS),
  );

  const saveClient = useCallback((client: Client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      const next = exists
        ? prev.map((c) => (c.id === client.id ? client : c))
        : [...prev, client];
      saveToStorage(CLIENTS_KEY, next);
      return next;
    });
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== clientId);
      saveToStorage(CLIENTS_KEY, next);
      return next;
    });
    setProjects((prev) => {
      const next = prev.filter((p) => p.clientId !== clientId);
      saveToStorage(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  const saveProject = useCallback((project: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      const next = exists
        ? prev.map((p) => (p.id === project.id ? project : p))
        : [...prev, project];
      saveToStorage(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      saveToStorage(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const next = [...prev, expense];
      saveToStorage(EXPENSES_KEY, next);
      return next;
    });
  }, []);

  const updateExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === expense.id ? expense : e));
      saveToStorage(EXPENSES_KEY, next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== expenseId);
      saveToStorage(EXPENSES_KEY, next);
      return next;
    });
  }, []);

  const stats = computeStats(clients, projects);
  const financeStats = computeFinanceStats(projects, expenses);

  // ---------------------------------------------------------------------------
  // Lead operations
  // ---------------------------------------------------------------------------

  const addLead = useCallback(
    (lead: Omit<Lead, "id" | "createdAt" | "archivedAt" | "activityLog">) => {
      setLeads((prev) => {
        const next: Lead[] = [
          ...prev,
          {
            ...lead,
            id: crypto.randomUUID(),
            activityLog: [],
            createdAt: new Date().toISOString(),
            archivedAt: null,
          },
        ];
        saveToStorage(LEADS_KEY, next);
        return next;
      });
    },
    [],
  );

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...updates } : l));
      saveToStorage(LEADS_KEY, next);
      return next;
    });
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveToStorage(LEADS_KEY, next);
      return next;
    });
  }, []);

  const archiveLead = useCallback((id: string) => {
    setLeads((prev) => {
      const next = prev.map((l) =>
        l.id === id ? { ...l, archivedAt: new Date().toISOString() } : l,
      );
      saveToStorage(LEADS_KEY, next);
      return next;
    });
  }, []);

  const addActivityEntry = useCallback(
    (leadId: string, entry: Omit<ActivityEntry, "id" | "timestamp">) => {
      setLeads((prev) => {
        const next = prev.map((l) => {
          if (l.id !== leadId) return l;
          const newEntry: ActivityEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          };
          return { ...l, activityLog: [...l.activityLog, newEntry] };
        });
        saveToStorage(LEADS_KEY, next);
        return next;
      });
    },
    [],
  );

  /** Active leads — archivedAt is null */
  const activeLeads = leads.filter((l) => l.archivedAt === null);

  return {
    clients,
    projects,
    expenses,
    leads,
    activeLeads,
    stats,
    financeStats,
    saveClient,
    deleteClient,
    saveProject,
    deleteProject,
    addExpense,
    updateExpense,
    deleteExpense,
    addLead,
    updateLead,
    deleteLead,
    archiveLead,
    addActivityEntry,
  };
}
