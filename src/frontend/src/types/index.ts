export type ProjectStatus = "Pending" | "InProgress" | "Completed";

export interface Task {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
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

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
}
