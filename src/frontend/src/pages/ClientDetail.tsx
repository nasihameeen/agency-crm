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
import type { Client, Project, ProjectStatus } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  FolderOpen,
  Pencil,
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

export function ClientDetail() {
  const { id } = useParams({ from: "/clients/$id" });
  const navigate = useNavigate();
  const { clients, projects, saveClient, deleteClient, saveProject } =
    useLocalData();
  const { success, error } = useToast();

  const client = clients.find((c) => c.id === id);
  const clientProjects = projects.filter((p) => p.clientId === id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    clientId: id,
    name: "",
    description: "",
    budget: 0,
    paidAmount: 0,
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
      paidAmount: 0,
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
    <div className="p-6 space-y-6" data-ocid="client_detail.page">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/clients" })}
          data-ocid="client_detail.back_link"
          className="gap-1.5"
        >
          <ArrowLeft className="size-4" /> Clients
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {client.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {client.businessName}
            </p>
          </div>
        </div>
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
            className="gap-1.5"
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-ocid="client_detail.delete_button"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card padding="sm">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium text-foreground mt-0.5 break-words">
            {client.email || "—"}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {client.phone || "—"}
          </p>
        </Card>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
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
          <Card
            className="text-center py-8"
            data-ocid="client_detail.projects.empty_state"
          >
            <FolderOpen className="size-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No projects for this client.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {clientProjects.map((project, i) => (
              <Card
                key={project.id}
                hoverable
                padding="sm"
                onClick={() =>
                  navigate({ to: "/projects/$id", params: { id: project.id } })
                }
                data-ocid={`client_detail.project.item.${i + 1}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
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

      {/* Edit Dialog */}
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
