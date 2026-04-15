import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
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
import type { Project, ProjectStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  DollarSign,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type ProjectForm = Omit<
  Project,
  "id" | "tasks" | "notes" | "links" | "createdAt"
>;

const EMPTY_FORM: ProjectForm = {
  clientId: "",
  name: "",
  description: "",
  budget: 0,
  paidAmount: 0,
  deadline: new Date().toISOString().split("T")[0],
  status: "Pending",
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const { clients, projects, saveProject, deleteProject } = useLocalData();
  const { success, error } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">(
    "All",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, clientId: clients[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({
      clientId: p.clientId,
      name: p.name,
      description: p.description,
      budget: p.budget,
      paidAmount: p.paidAmount,
      deadline: p.deadline,
      status: p.status,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      error("Project name is required");
      return;
    }
    if (!form.clientId) {
      error("Select a client");
      return;
    }
    saveProject(
      editTarget
        ? { ...editTarget, ...form }
        : {
            ...form,
            id: crypto.randomUUID(),
            tasks: [],
            notes: [],
            links: [],
            createdAt: Date.now(),
          },
    );
    success(editTarget ? "Project updated" : "Project created");
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    success("Project deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 space-y-6" data-ocid="projects.page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} total
          </p>
        </div>
        <Button
          data-ocid="projects.add_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="size-4" /> New Project
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            data-ocid="projects.search_input"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Pending", "InProgress", "Completed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              data-ocid={`projects.filter.${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s === "InProgress" ? "In Progress" : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12" data-ocid="projects.empty_state">
          <FolderOpen className="size-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first project to get started.
          </p>
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="size-4" /> New Project
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const client = clients.find((c) => c.id === project.clientId);
            const remaining = project.budget - project.paidAmount;
            const isOverdue =
              project.status !== "Completed" &&
              new Date(project.deadline) < new Date();
            return (
              <Card
                key={project.id}
                hoverable
                onClick={() =>
                  navigate({ to: "/projects/$id", params: { id: project.id } })
                }
                data-ocid={`projects.item.${i + 1}`}
                className="group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {client?.name ?? "Unknown client"}
                    </p>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span
                    className={isOverdue ? "text-orange-600 font-medium" : ""}
                  >
                    {isOverdue
                      ? "⚠ Overdue"
                      : `Due ${new Date(project.deadline).toLocaleDateString()}`}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <DollarSign className="size-3" />
                    {project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                  <div
                    className="bg-accent h-1.5 rounded-full transition-smooth"
                    style={{
                      width: `${project.budget > 0 ? Math.min(100, (project.paidAmount / project.budget) * 100) : 0}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-green-600 font-medium">
                    Paid ${project.paidAmount.toLocaleString()}
                  </span>
                  <span>Remaining ${remaining.toLocaleString()}</span>
                </div>
                <div
                  className="flex items-center gap-1 mt-4 pt-3 border-t border-border"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <Button
                    data-ocid={`projects.edit_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(project);
                    }}
                  >
                    <Pencil className="size-3" /> Edit
                  </Button>
                  <Button
                    data-ocid={`projects.delete_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(project);
                    }}
                  >
                    <Trash2 className="size-3" /> Delete
                  </Button>
                  <ChevronRight className="size-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="projects.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger data-ocid="projects.client_select">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="projects.name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                data-ocid="projects.description_input"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Budget ($)</Label>
                <Input
                  data-ocid="projects.budget_input"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, budget: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Paid ($)</Label>
                <Input
                  data-ocid="projects.paid_input"
                  type="number"
                  min={0}
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm((p) => ({
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
                  data-ocid="projects.deadline_input"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as ProjectStatus }))
                  }
                >
                  <SelectTrigger data-ocid="projects.status_select">
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
              data-ocid="projects.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button data-ocid="projects.submit_button" onClick={handleSave}>
              {editTarget ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Project"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
