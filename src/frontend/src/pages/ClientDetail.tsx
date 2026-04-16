import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { EmptyState } from "@/components/EmptyState";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskProgressBar } from "@/components/TaskProgressBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/useToast";
import type { Client, Project, ProjectStatus } from "@/types";
import { getPaymentStatus, getTaskProgress } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  DollarSign,
  FolderOpen,
  Layers,
  Mail,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

type ProjectForm = Omit<
  Project,
  "id" | "tasks" | "notes" | "links" | "createdAt"
>;

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

function formatRelativeDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Stat card for the analytics section */
function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
  ocid,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
  ocid: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${bgClass} p-4 flex flex-col gap-2 transition-smooth hover:-translate-y-0.5 hover:shadow-elevated`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-7 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <Icon className="size-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className="text-2xl font-bold text-foreground font-display"
        data-ocid={ocid}
      >
        {value}
      </p>
    </div>
  );
}

export function ClientDetail() {
  const { id } = useParams({ from: "/clients/$id" });
  const navigate = useNavigate();
  const { clients, projects, saveClient, deleteClient, saveProject } =
    useLocalData();
  const { success, error } = useToast();

  const client = clients.find((c) => c.id === id);
  const clientProjects = projects.filter((p) => p.clientId === id);

  // Analytics computations
  const totalRevenue = clientProjects.reduce(
    (sum, p) => sum + (p.paidAmount ?? 0),
    0,
  );
  const activeProjects = clientProjects.filter(
    (p) => p.status !== "Completed",
  ).length;
  const lastActivityTs =
    clientProjects.length > 0
      ? Math.max(...clientProjects.map((p) => p.createdAt))
      : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    clientId: id,
    name: "",
    description: "",
    budget: 0,
    budgetCurrency: "INR",
    paidAmount: 0,
    paidCurrency: "INR",
    deadline: new Date().toISOString().split("T")[0],
    status: "Pending",
  });
  const [form, setForm] = useState<
    Pick<Client, "name" | "phone" | "email" | "businessName">
  >({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    businessName: client?.businessName ?? "",
  });

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="link" onClick={() => navigate({ to: "/clients" })}>
          Back to clients
        </Button>
      </div>
    );
  }

  function handleSave() {
    if (!form.name.trim()) {
      error("Name is required");
      return;
    }
    saveClient({ ...client!, ...form });
    success("Client updated");
    setEditOpen(false);
  }

  function handleDelete() {
    deleteClient(client!.id);
    success("Client deleted");
    navigate({ to: "/clients" });
  }

  function handleAddProject() {
    if (!projectForm.name.trim()) {
      error("Project name is required");
      return;
    }
    saveProject({
      ...projectForm,
      id: crypto.randomUUID(),
      tasks: [],
      notes: [],
      links: [],
      createdAt: Date.now(),
    });
    success("Project created");
    setAddProjectOpen(false);
    setProjectForm({
      clientId: id,
      name: "",
      description: "",
      budget: 0,
      budgetCurrency: "INR",
      paidAmount: 0,
      paidCurrency: "INR",
      deadline: new Date().toISOString().split("T")[0],
      status: "Pending",
    });
  }

  function addNote() {
    if (!noteText.trim()) return;
    saveClient({
      ...client!,
      notes: [
        ...client!.notes,
        {
          id: crypto.randomUUID(),
          content: noteText.trim(),
          createdAt: Date.now(),
        },
      ],
    });
    setNoteText("");
    success("Note added");
  }

  function deleteNote(noteId: string) {
    saveClient({
      ...client!,
      notes: client!.notes.filter((n) => n.id !== noteId),
    });
  }

  return (
    <div className="p-6 space-y-6 page-fade-in" data-ocid="client_detail.page">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/clients" })}
        data-ocid="client_detail.back_link"
        className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Clients
      </Button>

      {/* Premium Client Header */}
      <div className="rounded-2xl gradient-header p-6 shadow-premium relative overflow-hidden">
        {/* Decorative radial glow */}
        <div
          className="absolute -top-8 -right-8 size-48 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.20 275), transparent 70%)",
          }}
        />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Large avatar */}
            <div className="size-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-elevated flex-shrink-0">
              <span className="text-2xl font-bold text-white select-none">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-display font-bold text-white leading-tight">
                {client.name}
              </h1>
              {client.businessName && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="size-3.5 text-white/60" />
                  <p className="text-sm text-white/70">{client.businessName}</p>
                </div>
              )}
              {/* Contact info pills */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {client.email && (
                  <span className="flex items-center gap-1 text-xs text-white/60 bg-white/10 rounded-full px-2.5 py-1">
                    <Mail className="size-3" />
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1 text-xs text-white/60 bg-white/10 rounded-full px-2.5 py-1">
                    <Phone className="size-3" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              data-ocid="client_detail.edit_button"
              onClick={() => {
                setForm({
                  name: client.name,
                  phone: client.phone,
                  email: client.email,
                  businessName: client.businessName,
                });
                setEditOpen(true);
              }}
              className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-ocid="client_detail.delete_button"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5 bg-white/5 border-red-400/30 text-red-300 hover:bg-red-500/15"
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="client_detail.analytics.section"
      >
        <StatCard
          icon={Layers}
          label="Total Projects"
          value={String(clientProjects.length)}
          colorClass="bg-sky-500"
          bgClass="border-sky-100 bg-sky-50"
          ocid="client_detail.analytics.total_projects"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          colorClass="bg-emerald-500"
          bgClass="border-emerald-100 bg-emerald-50"
          ocid="client_detail.analytics.total_revenue"
        />
        <StatCard
          icon={BarChart3}
          label="Active"
          value={String(activeProjects)}
          colorClass="bg-orange-500"
          bgClass="border-orange-100 bg-orange-50"
          ocid="client_detail.analytics.active_projects"
        />
        <StatCard
          icon={CalendarDays}
          label="Last Activity"
          value={lastActivityTs ? formatRelativeDate(lastActivityTs) : "—"}
          colorClass="bg-purple-500"
          bgClass="border-purple-100 bg-purple-50"
          ocid="client_detail.analytics.last_activity"
        />
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FolderOpen className="size-3.5" />
            Projects ({clientProjects.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            data-ocid="client_detail.add_project_button"
            onClick={() => setAddProjectOpen(true)}
            className="gap-1.5 h-7 text-xs"
          >
            <Plus className="size-3" /> Add
          </Button>
        </div>

        {clientProjects.length === 0 ? (
          <Card data-ocid="client_detail.projects.empty_state">
            <EmptyState
              icon={FolderOpen}
              title="No projects for this client"
              description={`Add the first project for ${client.name} to start tracking progress.`}
              ctaLabel="Add Project"
              onCta={() => setAddProjectOpen(true)}
              size="sm"
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {clientProjects.map((project, i) => {
              const { done, total, percent } = getTaskProgress(
                project.tasks ?? [],
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
                  data-ocid={`client_detail.project.item.${i + 1}`}
                  className="group animate-item-in"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: name + badges */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {project.name}
                        </p>
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5 mb-2">
                        <StatusBadge status={project.status} size="sm" />
                        <PaymentBadge
                          status={getPaymentStatus(
                            project.budget,
                            project.paidAmount,
                          )}
                        />
                        <DeadlineBadge
                          deadline={project.deadline}
                          status={project.status}
                        />
                      </div>
                      {/* Task progress bar */}
                      {total > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full progress-gradient animate-progress"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {done}/{total} tasks
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: budget + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(project.budget)}
                        </p>
                        <p className="text-xs text-muted-foreground">budget</p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <StickyNote className="size-3.5" /> Notes
        </h2>
        <div className="flex gap-2 mb-3">
          <Textarea
            data-ocid="client_detail.note_input"
            placeholder="Add a note…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="resize-none min-h-[60px]"
            rows={2}
          />
          <Button
            data-ocid="client_detail.add_note_button"
            onClick={addNote}
            className="self-end flex-shrink-0"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {client.notes.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="client_detail.notes.empty_state"
          >
            No notes yet.
          </p>
        ) : (
          <div className="space-y-2">
            {[...client.notes].reverse().map((note, i) => (
              <Card
                key={note.id}
                padding="sm"
                data-ocid={`client_detail.note.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground flex-1 break-words">
                    {note.content}
                  </p>
                  <button
                    type="button"
                    data-ocid={`client_detail.note.delete_button.${i + 1}`}
                    onClick={() => deleteNote(note.id)}
                    className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    aria-label="Delete note"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent
          className="max-w-md"
          data-ocid="client_detail.add_project_dialog"
        >
          <DialogHeader>
            <DialogTitle>New Project for {client.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="client_detail.project_name_input"
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                data-ocid="client_detail.project_description_input"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm((p) => ({ ...p, description: e.target.value }))
                }
                className="resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Budget ($)</Label>
                <Input
                  data-ocid="client_detail.project_budget_input"
                  type="number"
                  min={0}
                  value={projectForm.budget}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      budget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Paid ($)</Label>
                <Input
                  data-ocid="client_detail.project_paid_input"
                  type="number"
                  min={0}
                  value={projectForm.paidAmount}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      paidAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input
                  data-ocid="client_detail.project_deadline_input"
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={projectForm.status}
                  onValueChange={(v) =>
                    setProjectForm((p) => ({
                      ...p,
                      status: v as ProjectStatus,
                    }))
                  }
                >
                  <SelectTrigger data-ocid="client_detail.project_status_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="client_detail.add_project_cancel_button"
              onClick={() => setAddProjectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="client_detail.add_project_submit_button"
              onClick={handleAddProject}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="client_detail.edit_dialog">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(["name", "businessName", "email", "phone"] as const).map(
              (field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={`edit-${field}`}>
                    {field === "businessName"
                      ? "Business Name"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={`edit-${field}`}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                  />
                </div>
              ),
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button data-ocid="client_detail.save_button" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Client"
        description={`Delete ${client.name}? All their projects will also be removed.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
