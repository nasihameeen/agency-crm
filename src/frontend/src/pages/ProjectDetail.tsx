import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeadlineBadge } from "@/components/DeadlineBadge";
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
import { getPaymentStatus } from "@/types";
import type { FileLink, Project, ProjectStatus, Task } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  DollarSign,
  Link2,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const navigate = useNavigate();
  const { clients, projects, saveProject, deleteProject } = useLocalData();
  const { success, error } = useToast();

  const project = projects.find((p) => p.id === id);
  const client = project
    ? clients.find((c) => c.id === project.clientId)
    : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [noteText, setNoteText] = useState("");
  const [taskName, setTaskName] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const taskInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState<
    Pick<
      Project,
      "name" | "description" | "budget" | "paidAmount" | "deadline" | "status"
    >
  >({
    name: project?.name ?? "",
    description: project?.description ?? "",
    budget: project?.budget ?? 0,
    paidAmount: project?.paidAmount ?? 0,
    deadline: project?.deadline ?? "",
    status: project?.status ?? "Pending",
  });

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="link" onClick={() => navigate({ to: "/projects" })}>
          Back to projects
        </Button>
      </div>
    );
  }

  const p: Project = project;

  const remaining = p.budget - p.paidAmount;
  const paymentPct =
    p.budget > 0 ? Math.min(100, (p.paidAmount / p.budget) * 100) : 0;
  const paymentStatus = getPaymentStatus(p.budget, p.paidAmount);
  const doneTasks = p.tasks.filter((t) => t.done).length;

  function update(patch: Partial<Project>) {
    saveProject({ ...p, ...patch } as Project);
  }

  function handleSaveEdit() {
    if (!editForm.name.trim()) {
      error("Name is required");
      return;
    }
    update(editForm);
    success("Project updated");
    setEditOpen(false);
  }

  function handleDelete() {
    deleteProject(p.id);
    success("Project deleted");
    navigate({ to: "/projects" });
  }

  function handleMarkComplete() {
    update({ status: "Completed" });
    success("Project marked as completed");
  }

  function handleAddPayment() {
    const amount = Number.parseFloat(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      error("Enter a valid amount");
      return;
    }
    const newPaid = Math.min(p.budget, p.paidAmount + amount);
    update({ paidAmount: newPaid });
    success(`$${amount.toLocaleString()} payment recorded`);
    setPaymentAmount("");
    setPaymentOpen(false);
  }

  function addTask() {
    if (!taskName.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      name: taskName.trim(),
      done: false,
      createdAt: Date.now(),
    };
    update({ tasks: [...p.tasks, task] });
    setTaskName("");
  }

  function toggleTask(taskId: string) {
    update({
      tasks: p.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      ),
    });
  }

  function deleteTask(taskId: string) {
    update({ tasks: p.tasks.filter((t) => t.id !== taskId) });
  }

  function addNote() {
    if (!noteText.trim()) return;
    update({
      notes: [
        ...p.notes,
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
    update({ notes: p.notes.filter((n) => n.id !== noteId) });
  }

  function addLink() {
    if (!linkUrl.trim()) {
      error("URL is required");
      return;
    }
    const link: FileLink = {
      id: crypto.randomUUID(),
      label: linkLabel.trim() || linkUrl,
      url: linkUrl.trim(),
      createdAt: Date.now(),
    };
    update({ links: [...p.links, link] });
    setLinkLabel("");
    setLinkUrl("");
    success("Link added");
  }

  function deleteLink(linkId: string) {
    update({ links: p.links.filter((l) => l.id !== linkId) });
  }

  return (
    <div
      className="p-6 space-y-6 max-w-3xl mx-auto"
      data-ocid="project_detail.page"
    >
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/projects" })}
        data-ocid="project_detail.back_link"
        className="gap-1.5 -ml-1"
      >
        <ArrowLeft className="size-4" /> Projects
      </Button>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
              {p.name}
            </h1>
            <StatusBadge status={p.status} />
            <DeadlineBadge deadline={p.deadline} status={p.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {client?.name ?? "Unknown client"}
            {client?.businessName ? ` · ${client.businessName}` : ""}
          </p>
          {p.deadline && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Deadline: {new Date(p.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            data-ocid="project_detail.edit_button"
            onClick={() => {
              setEditForm({
                name: p.name,
                description: p.description,
                budget: p.budget,
                paidAmount: p.paidAmount,
                deadline: p.deadline,
                status: p.status,
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
            data-ocid="project_detail.delete_button"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/40 border border-border/50"
        data-ocid="project_detail.quick_actions"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
          <Zap className="size-3.5" /> Quick Actions
        </span>
        {p.status !== "Completed" && (
          <Button
            size="sm"
            data-ocid="project_detail.mark_complete_button"
            onClick={handleMarkComplete}
            className="gap-1.5 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            <CheckCircle2 className="size-3.5" /> Mark Complete
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          data-ocid="project_detail.quick_payment_button"
          onClick={() => setPaymentOpen(true)}
          className="gap-1.5 h-7 text-xs"
        >
          <DollarSign className="size-3.5" /> Add Payment
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-ocid="project_detail.quick_task_button"
          onClick={() => taskInputRef.current?.focus()}
          className="gap-1.5 h-7 text-xs"
        >
          <Plus className="size-3.5" /> Add Task
        </Button>
      </div>

      {/* Description */}
      {p.description && (
        <Card padding="sm">
          <p className="text-sm text-foreground">{p.description}</p>
        </Card>
      )}

      {/* Payment */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="size-4 text-primary" /> Payment
          </h2>
          <PaymentBadge status={paymentStatus} />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            {
              label: "Total Budget",
              value: `$${p.budget.toLocaleString()}`,
              cls: "text-foreground",
            },
            {
              label: "Paid",
              value: `$${p.paidAmount.toLocaleString()}`,
              cls: "text-emerald-600",
            },
            {
              label: "Remaining",
              value: `$${remaining.toLocaleString()}`,
              cls: remaining > 0 ? "text-orange-600" : "text-emerald-600",
            },
          ].map(({ label, value, cls }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-lg font-bold font-display ${cls} mt-0.5`}>
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-smooth"
            style={{ width: `${paymentPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-muted-foreground">
            {Math.round(paymentPct)}% paid
          </p>
          <button
            type="button"
            data-ocid="project_detail.add_payment_inline_button"
            onClick={() => setPaymentOpen(true)}
            className="text-xs text-primary hover:underline font-medium"
          >
            + Add Payment
          </button>
        </div>
      </Card>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            Tasks
            <span className="text-xs font-normal text-muted-foreground normal-case tracking-normal">
              {doneTasks}/{p.tasks.length} done
            </span>
          </h2>
          <button
            type="button"
            data-ocid="project_detail.quick_add_task_button"
            onClick={() => taskInputRef.current?.focus()}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            <Plus className="size-3" /> Quick Add
          </button>
        </div>

        {/* Task progress bar */}
        {p.tasks.length > 0 && (
          <div className="mb-3">
            <TaskProgressBar tasks={p.tasks} />
          </div>
        )}

        {/* Add task input */}
        <div className="flex gap-2 mb-3">
          <Input
            ref={taskInputRef}
            data-ocid="project_detail.task_input"
            placeholder="Add a task… (press Enter)"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <Button
            data-ocid="project_detail.add_task_button"
            onClick={addTask}
            className="flex-shrink-0"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {/* Task list */}
        {p.tasks.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-8 text-center rounded-xl border border-dashed border-border/60"
            data-ocid="project_detail.tasks.empty_state"
          >
            <CheckCircle2 className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No tasks yet. Add your first task above.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {p.tasks.map((task, i) => (
              <Card
                key={task.id}
                padding="sm"
                data-ocid={`project_detail.task.item.${i + 1}`}
                className={`transition-colors ${task.done ? "opacity-75" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {/* Custom checkbox button */}
                  <button
                    type="button"
                    data-ocid={`project_detail.task.toggle.${i + 1}`}
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                      task.done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border hover:border-emerald-400 bg-background"
                    }`}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.done && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={`flex-1 text-sm min-w-0 break-words ${
                      task.done
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.name}
                  </span>
                  <button
                    type="button"
                    data-ocid={`project_detail.task.delete_button.${i + 1}`}
                    onClick={() => deleteTask(task.id)}
                    className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <X className="size-3.5" />
                  </button>
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
            data-ocid="project_detail.note_input"
            placeholder="Add a note…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="resize-none min-h-[60px]"
            rows={2}
          />
          <Button
            data-ocid="project_detail.add_note_button"
            onClick={addNote}
            className="self-end flex-shrink-0"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {p.notes.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="project_detail.notes.empty_state"
          >
            No notes yet.
          </p>
        ) : (
          <div className="space-y-2">
            {[...p.notes].reverse().map((note, i) => (
              <Card
                key={note.id}
                padding="sm"
                data-ocid={`project_detail.note.item.${i + 1}`}
              >
                <div className="flex items-start gap-2">
                  <p className="text-sm text-foreground flex-1 break-words">
                    {note.content}
                  </p>
                  <button
                    type="button"
                    data-ocid={`project_detail.note.delete_button.${i + 1}`}
                    onClick={() => deleteNote(note.id)}
                    className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
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

      {/* File Links */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Link2 className="size-3.5" /> File Links
        </h2>
        <div className="flex gap-2 mb-3 flex-wrap">
          <Input
            data-ocid="project_detail.link_label_input"
            placeholder="Label (optional)"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className="flex-1 min-w-[120px]"
          />
          <Input
            data-ocid="project_detail.link_url_input"
            placeholder="URL (e.g. Google Drive)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-[2] min-w-[200px]"
          />
          <Button
            data-ocid="project_detail.add_link_button"
            onClick={addLink}
            className="flex-shrink-0"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {p.links.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="project_detail.links.empty_state"
          >
            No links yet.
          </p>
        ) : (
          <div className="space-y-2">
            {p.links.map((link, i) => (
              <Card
                key={link.id}
                padding="sm"
                data-ocid={`project_detail.link.item.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-primary flex-shrink-0" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex-1 truncate"
                  >
                    {link.label}
                  </a>
                  <button
                    type="button"
                    data-ocid={`project_detail.link.delete_button.${i + 1}`}
                    onClick={() => deleteLink(link.id)}
                    className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete link"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent
          className="max-w-sm"
          data-ocid="project_detail.payment_dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-semibold text-foreground">
                ${remaining.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5">
              <Label>Amount to add ($)</Label>
              <Input
                data-ocid="project_detail.payment_amount_input"
                type="number"
                min={1}
                max={remaining}
                placeholder={`Max $${remaining.toLocaleString()}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPayment()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="project_detail.payment_cancel_button"
              onClick={() => {
                setPaymentOpen(false);
                setPaymentAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="project_detail.payment_confirm_button"
              onClick={handleAddPayment}
              className="gap-1.5"
            >
              <DollarSign className="size-3.5" /> Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-w-md"
          data-ocid="project_detail.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.budget}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      budget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Paid ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.paidAmount}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
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
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: v as ProjectStatus,
                    }))
                  }
                >
                  <SelectTrigger data-ocid="project_detail.status_select">
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
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              data-ocid="project_detail.save_button"
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project"
        description={`Delete "${p.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
