import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ActivityEntry, Lead, LeadSource, LeadStatus } from "@/types";
import {
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutList,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Rows3,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const COLUMNS: {
  status: LeadStatus;
  label: string;
  color: string;
  border: string;
  badge: string;
}[] = [
  {
    status: "New",
    label: "New",
    color: "text-[oklch(0.55_0.01_250)]",
    border: "border-l-[oklch(0.72_0.01_250)]",
    badge: "bg-[oklch(0.92_0.01_250)] text-[oklch(0.35_0.01_250)]",
  },
  {
    status: "Contacted",
    label: "Contacted",
    color: "text-[oklch(0.52_0.18_240)]",
    border: "border-l-[oklch(0.62_0.18_240)]",
    badge: "bg-[oklch(0.92_0.06_240)] text-[oklch(0.35_0.15_240)]",
  },
  {
    status: "Interested",
    label: "Interested",
    color: "text-[oklch(0.52_0.18_280)]",
    border: "border-l-[oklch(0.62_0.2_275)]",
    badge: "bg-[oklch(0.92_0.06_280)] text-[oklch(0.35_0.15_280)]",
  },
  {
    status: "ProposalSent",
    label: "Proposal Sent",
    color: "text-[oklch(0.62_0.18_55)]",
    border: "border-l-[oklch(0.72_0.17_55)]",
    badge: "bg-[oklch(0.94_0.06_55)]  text-[oklch(0.35_0.15_55)]",
  },
  {
    status: "Converted",
    label: "Converted",
    color: "text-[oklch(0.42_0.16_142)]",
    border: "border-l-[oklch(0.52_0.18_142)]",
    badge: "bg-[oklch(0.92_0.06_142)] text-[oklch(0.32_0.14_142)]",
  },
  {
    status: "Lost",
    label: "Lost",
    color: "text-[oklch(0.50_0.20_25)]",
    border: "border-l-[oklch(0.54_0.22_25)]",
    badge: "bg-[oklch(0.94_0.06_25)]  text-[oklch(0.35_0.15_25)]",
  },
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  New: "bg-[oklch(0.92_0.01_250)] text-[oklch(0.35_0.01_250)]",
  Contacted: "bg-[oklch(0.92_0.06_240)] text-[oklch(0.35_0.15_240)]",
  Interested: "bg-[oklch(0.92_0.06_280)] text-[oklch(0.35_0.15_280)]",
  ProposalSent: "bg-[oklch(0.94_0.06_55)] text-[oklch(0.35_0.15_55)]",
  Converted: "bg-[oklch(0.92_0.06_142)] text-[oklch(0.32_0.14_142)]",
  Lost: "bg-[oklch(0.94_0.06_25)] text-[oklch(0.35_0.15_25)]",
};

const SOURCES: LeadSource[] = [
  "Instagram",
  "WhatsApp",
  "Referral",
  "Facebook",
  "LinkedIn",
  "Website",
  "Other",
];
const STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "ProposalSent",
  "Converted",
  "Lost",
];
const STATUS_LABELS: Record<LeadStatus, string> = {
  New: "New",
  Contacted: "Contacted",
  Interested: "Interested",
  ProposalSent: "Proposal Sent",
  Converted: "Converted",
  Lost: "Lost",
};
const ACTIVITY_TYPES: ActivityEntry["type"][] = ["Call", "Message", "Meeting"];
const ACTIVITY_ICONS: Record<
  ActivityEntry["type"],
  React.FC<{ className?: string }>
> = {
  Call: Phone,
  Message: MessageSquare,
  Meeting: Video,
};

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function getFollowUpStatus(
  date: string | null,
): "overdue" | "today" | "normal" | "none" {
  if (!date) return "none";
  const t = today();
  if (date < t) return "overdue";
  if (date === t) return "today";
  return "normal";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isThisWeek(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return d >= weekStart && d <= weekEnd;
}

// ---------------------------------------------------------------------------
// Import success toast
// ---------------------------------------------------------------------------

interface ImportToastProps {
  count: number;
  onDismiss: () => void;
}

function ImportToast({ count, onDismiss }: ImportToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      data-ocid="import.success_state"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-premium bg-[oklch(0.28_0.04_142)] border border-[oklch(0.52_0.18_142)/40] text-white animate-slide-up"
      style={{ minWidth: 260 }}
    >
      <CheckCircle2 className="size-4 text-[oklch(0.72_0.18_142)] shrink-0" />
      <span className="text-sm font-medium">
        {count} lead{count !== 1 ? "s" : ""} imported to pipeline
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lead form modal
// ---------------------------------------------------------------------------

type LeadFormData = Omit<
  Lead,
  "id" | "createdAt" | "archivedAt" | "activityLog"
>;

const EMPTY_FORM: LeadFormData = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  source: "Instagram",
  status: "New",
  notes: "",
  followUpDate: null,
};

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Lead | null;
  onSave: (data: LeadFormData) => void;
}

function LeadFormModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: LeadFormModalProps) {
  const [form, setForm] = useState<LeadFormData>(
    initial
      ? {
          name: initial.name,
          phone: initial.phone,
          email: initial.email,
          companyName: initial.companyName,
          source: initial.source,
          status: initial.status,
          notes: initial.notes,
          followUpDate: initial.followUpDate,
        }
      : EMPTY_FORM,
  );

  const handleOpen = (v: boolean) => {
    if (v && initial) {
      setForm({
        name: initial.name,
        phone: initial.phone,
        email: initial.email,
        companyName: initial.companyName,
        source: initial.source,
        status: initial.status,
        notes: initial.notes,
        followUpDate: initial.followUpDate,
      });
    } else if (v) {
      setForm(EMPTY_FORM);
    }
    onOpenChange(v);
  };

  function field(k: keyof LeadFormData, val: string) {
    setForm((prev) => ({
      ...prev,
      [k]: val || (k === "followUpDate" ? null : val),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) return;
    onSave(form);
    handleOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg" data-ocid="lead.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {initial ? "Edit Lead" : "Add New Lead"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lead-name"
                data-ocid="lead.name_input"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-company">Company</Label>
              <Input
                id="lead-company"
                data-ocid="lead.company_input"
                value={form.companyName}
                onChange={(e) => field("companyName", e.target.value)}
                placeholder="Company name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lead-phone"
                data-ocid="lead.phone_input"
                value={form.phone}
                onChange={(e) => field("phone", e.target.value)}
                placeholder="+1 (555) ..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lead-email"
                type="email"
                data-ocid="lead.email_input"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => field("source", v)}
              >
                <SelectTrigger data-ocid="lead.source_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => field("status", v as LeadStatus)}
              >
                <SelectTrigger data-ocid="lead.status_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-followup">Follow-up Date</Label>
            <Input
              id="lead-followup"
              type="date"
              data-ocid="lead.followup_input"
              value={form.followUpDate ?? ""}
              onChange={(e) => field("followUpDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea
              id="lead-notes"
              data-ocid="lead.notes_textarea"
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              placeholder="Lead context, requirements, budget..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="lead.cancel_button"
              onClick={() => handleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="lead.submit_button"
              className="gradient-accent text-white shadow-glow"
            >
              {initial ? "Save Changes" : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Activity panel
// ---------------------------------------------------------------------------

interface ActivityPanelProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLogActivity: (type: ActivityEntry["type"], notes: string) => void;
  onConvert: () => void;
}

function ActivityPanel({
  lead,
  open,
  onOpenChange,
  onLogActivity,
  onConvert,
}: ActivityPanelProps) {
  const [actType, setActType] = useState<ActivityEntry["type"]>("Call");
  const [actNotes, setActNotes] = useState("");

  function handleLog(e: React.FormEvent) {
    e.preventDefault();
    if (!actNotes.trim()) return;
    onLogActivity(actType, actNotes.trim());
    setActNotes("");
  }

  const sorted = [...lead.activityLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        data-ocid="activity.dialog"
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between pr-6">
            <div>
              <DialogTitle className="font-display text-lg">
                {lead.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {lead.companyName || "—"} · Activity Log
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              data-ocid="activity.convert_button"
              className="text-xs border-[oklch(0.52_0.18_142)/40] text-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.52_0.18_142)/10] shrink-0"
              onClick={onConvert}
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Convert to Client
            </Button>
          </div>
        </DialogHeader>

        <div className="shrink-0 border rounded-xl p-4 bg-muted/40 mx-0 my-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Log Activity
          </p>
          <form onSubmit={handleLog} className="space-y-3">
            <div className="flex gap-2">
              {ACTIVITY_TYPES.map((t) => {
                const Icon = ACTIVITY_ICONS[t];
                const active = actType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    data-ocid={`activity.type_${t.toLowerCase()}`}
                    onClick={() => setActType(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {t}
                  </button>
                );
              })}
            </div>
            <Textarea
              data-ocid="activity.notes_textarea"
              value={actNotes}
              onChange={(e) => setActNotes(e.target.value)}
              placeholder="What happened? Add context, outcomes, next steps..."
              rows={2}
              className="text-sm resize-none"
              required
            />
            <Button
              type="submit"
              size="sm"
              data-ocid="activity.log_button"
              className="w-full gradient-accent text-white shadow-glow text-xs"
              disabled={!actNotes.trim()}
            >
              <Plus className="size-3.5 mr-1.5" />
              Log Activity
            </Button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {sorted.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No activities yet"
              description="Log your first call, message, or meeting above."
              size="sm"
              data-ocid="activity.empty_state"
            />
          ) : (
            sorted.map((entry, i) => {
              const Icon = ACTIVITY_ICONS[entry.type];
              return (
                <div
                  key={entry.id}
                  data-ocid={`activity.item.${i + 1}`}
                  className="flex gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {entry.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1 leading-relaxed break-words">
                      {entry.notes}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Lead card — compact version for Kanban
// ---------------------------------------------------------------------------

interface LeadCardProps {
  lead: Lead;
  colBorder: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onActivity: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function LeadCard({
  lead,
  colBorder,
  index,
  onEdit,
  onDelete,
  onActivity,
  onDragStart,
}: LeadCardProps) {
  const fuStatus = getFollowUpStatus(lead.followUpDate);
  const overdueAccent =
    fuStatus === "overdue"
      ? "border-l-destructive"
      : fuStatus === "today"
        ? "border-l-[oklch(0.72_0.17_62)]"
        : colBorder;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      data-ocid={`lead.item.${index}`}
      className={`group rounded-xl bg-card border border-border border-l-[3px] ${overdueAccent} shadow-sm
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1.5 min-w-0">
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground truncate leading-tight">
              {lead.name}
            </p>
            {lead.companyName && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="size-2.5 text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground truncate">
                  {lead.companyName}
                </p>
              </div>
            )}
          </div>
          <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-tight whitespace-nowrap">
            {lead.source}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Phone className="size-2.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">
            {lead.phone}
          </span>
        </div>

        {lead.followUpDate && (
          <div
            className={`flex items-center gap-1 text-[10px] font-medium w-fit px-1.5 py-0.5 rounded-md ${
              fuStatus === "overdue"
                ? "bg-destructive/10 text-destructive"
                : fuStatus === "today"
                  ? "bg-[oklch(0.72_0.17_62)/15] text-[oklch(0.52_0.17_62)]"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <CalendarDays className="size-2.5 shrink-0" />
            {fuStatus === "overdue" && "Overdue · "}
            {fuStatus === "today" && "Today · "}
            {formatDate(lead.followUpDate)}
          </div>
        )}

        <div className="flex items-center gap-1 pt-1 border-t border-border/50">
          <Button
            size="sm"
            variant="ghost"
            data-ocid={`lead.activity_button.${index}`}
            className="h-6 px-1.5 text-[10px] text-accent hover:bg-accent/10 flex-1"
            onClick={onActivity}
          >
            <ClipboardList className="size-2.5 mr-1 shrink-0" />
            Activity
            {lead.activityLog.length > 0 && (
              <span className="ml-1 size-3.5 rounded-full bg-accent/15 text-accent text-[9px] font-bold flex items-center justify-center shrink-0">
                {lead.activityLog.length}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            data-ocid={`lead.edit_button.${index}`}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onEdit}
          >
            <Pencil className="size-2.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            data-ocid={`lead.delete_button.${index}`}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="size-2.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban column
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onActivityLead: (lead: Lead) => void;
  onDragStartLead: (e: React.DragEvent, leadId: string) => void;
  colIndex: number;
}

function KanbanColumn({
  col,
  leads,
  onDragOver,
  onDrop,
  isDragOver,
  onEditLead,
  onDeleteLead,
  onActivityLead,
  onDragStartLead,
  colIndex,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-ocid={`leads.column.${colIndex + 1}`}
      className={`flex flex-col min-w-[180px] max-w-[220px] flex-1 rounded-2xl transition-all duration-200 ${
        isDragOver ? "bg-accent/5 ring-2 ring-accent/30" : "bg-muted/30"
      }`}
    >
      <div
        className={`px-3 pt-3 pb-2 border-b border-border/40 border-l-4 rounded-t-2xl ${col.border.replace("border-l-", "border-l-")}`}
      >
        <div className="flex items-center justify-between gap-1">
          <h3
            className={`font-semibold text-xs font-display truncate ${col.color}`}
          >
            {col.label}
          </h3>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${col.badge}`}
          >
            {leads.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[100px]">
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-border/50">
            <p className="text-[10px] text-muted-foreground/60">Drop here</p>
          </div>
        )}
        {leads.map((lead, i) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            colBorder={col.border}
            index={i + 1}
            onEdit={() => onEditLead(lead)}
            onDelete={() => onDeleteLead(lead)}
            onActivity={() => onActivityLead(lead)}
            onDragStart={(e) => onDragStartLead(e, lead.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leads List View (table)
// ---------------------------------------------------------------------------

type FollowUpFilter = "all" | "today" | "overdue" | "week";

interface LeadsListTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: LeadStatus | "all";
  onStatusFilterChange: (v: LeadStatus | "all") => void;
  sourceFilter: LeadSource | "all";
  onSourceFilterChange: (v: LeadSource | "all") => void;
  followUpFilter: FollowUpFilter;
  onFollowUpFilterChange: (v: FollowUpFilter) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onActivity: (lead: Lead) => void;
  onLogQuickActivity: (lead: Lead, type: ActivityEntry["type"]) => void;
  onBulkDelete: () => void;
  onBulkUpdateStatus: (status: LeadStatus) => void;
}

function LeadsListTable({
  leads,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  followUpFilter,
  onFollowUpFilterChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onActivity,
  onLogQuickActivity,
  onBulkDelete,
  onBulkUpdateStatus,
}: LeadsListTableProps) {
  const [bulkStatusValue, setBulkStatusValue] = useState<LeadStatus>("New");
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Apply filters
  const filtered = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.companyName.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;

    let matchesFollowUp = true;
    if (followUpFilter === "today") {
      matchesFollowUp = getFollowUpStatus(l.followUpDate) === "today";
    } else if (followUpFilter === "overdue") {
      matchesFollowUp = getFollowUpStatus(l.followUpDate) === "overdue";
    } else if (followUpFilter === "week") {
      matchesFollowUp = !!l.followUpDate && isThisWeek(l.followUpDate);
    }

    return matchesSearch && matchesStatus && matchesSource && matchesFollowUp;
  });

  const allFilteredIds = filtered.map((l) => l.id);
  const allSelected =
    filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));
  const someSelected = selectedIds.size > 0;

  const FOLLOWUP_FILTERS: { value: FollowUpFilter; label: string }[] = [
    { value: "all", label: "All Follow-ups" },
    { value: "today", label: "Today" },
    { value: "overdue", label: "Overdue" },
    { value: "week", label: "This Week" },
  ];

  return (
    <div className="space-y-3" data-ocid="leads.list_view">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Input
            data-ocid="leads.list_search_input"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 text-xs pl-3"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as LeadStatus | "all")}
        >
          <SelectTrigger
            data-ocid="leads.list_status_filter"
            className="h-8 text-xs w-[140px]"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source filter */}
        <Select
          value={sourceFilter}
          onValueChange={(v) => onSourceFilterChange(v as LeadSource | "all")}
        >
          <SelectTrigger
            data-ocid="leads.list_source_filter"
            className="h-8 text-xs w-[130px]"
          >
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Follow-up quick filter pills */}
        <div
          className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5"
          data-ocid="leads.followup_filter"
        >
          {FOLLOWUP_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              data-ocid={`leads.followup_filter_${f.value}`}
              onClick={() => onFollowUpFilterChange(f.value)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                followUpFilter === f.value
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div
          data-ocid="leads.bulk_actions"
          className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <span className="text-xs font-semibold text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Select
              value={bulkStatusValue}
              onValueChange={(v) => setBulkStatusValue(v as LeadStatus)}
            >
              <SelectTrigger
                data-ocid="leads.bulk_status_select"
                className="h-7 text-xs w-[140px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              data-ocid="leads.bulk_update_status_button"
              className="h-7 text-xs"
              onClick={() => onBulkUpdateStatus(bulkStatusValue)}
            >
              Update Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid="leads.bulk_delete_button"
              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setConfirmBulkDelete(true)}
            >
              <Trash2 className="size-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={
              searchQuery ||
              statusFilter !== "all" ||
              sourceFilter !== "all" ||
              followUpFilter !== "all"
                ? "No leads match your filters"
                : "No leads yet"
            }
            description={
              searchQuery ||
              statusFilter !== "all" ||
              sourceFilter !== "all" ||
              followUpFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first lead to get started."
            }
            data-ocid="leads.list_empty_state"
            size="sm"
          />
        </Card>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          data-ocid="leads.list_table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 border-b border-border backdrop-blur-sm">
                  <th className="w-10 px-3 py-2.5 text-left">
                    <Checkbox
                      data-ocid="leads.list_select_all_checkbox"
                      checked={allSelected}
                      onCheckedChange={() => onToggleSelectAll(allFilteredIds)}
                      aria-label="Select all"
                    />
                  </th>
                  {[
                    "Lead Name",
                    "Company",
                    "Phone",
                    "Email",
                    "Status",
                    "Follow-up",
                    "Source",
                    "Activity",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead, i) => {
                  const fuStatus = getFollowUpStatus(lead.followUpDate);
                  const isSelected = selectedIds.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      data-ocid={`leads.list_row.${i + 1}`}
                      className={`bg-card transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2">
                        <Checkbox
                          data-ocid={`leads.list_select_checkbox.${i + 1}`}
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(lead.id)}
                          aria-label={`Select ${lead.name}`}
                        />
                      </td>
                      {/* Name */}
                      <td className="px-3 py-2">
                        <p className="font-semibold text-xs text-foreground truncate max-w-[140px]">
                          {lead.name}
                        </p>
                      </td>
                      {/* Company */}
                      <td className="px-3 py-2">
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {lead.companyName || "—"}
                        </p>
                      </td>
                      {/* Phone */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {lead.phone || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {lead.email || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Status badge */}
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_BADGE[lead.status]}`}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      {/* Follow-up */}
                      <td className="px-3 py-2">
                        {lead.followUpDate ? (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-medium w-fit px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                              fuStatus === "overdue"
                                ? "bg-destructive/10 text-destructive"
                                : fuStatus === "today"
                                  ? "bg-[oklch(0.72_0.17_62)/15] text-[oklch(0.52_0.17_62)]"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <CalendarDays className="size-2.5 shrink-0" />
                            {fuStatus === "overdue" && "Overdue · "}
                            {fuStatus === "today" && "Today · "}
                            {formatDate(lead.followUpDate)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </td>
                      {/* Source */}
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                          {lead.source}
                        </span>
                      </td>
                      {/* Activity count */}
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          data-ocid={`leads.list_activity_button.${i + 1}`}
                          onClick={() => onActivity(lead)}
                          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                        >
                          <ClipboardList className="size-3 shrink-0" />
                          {lead.activityLog.length > 0 ? (
                            <span className="font-semibold">
                              {lead.activityLog.length}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-0.5">
                          {/* Quick Call */}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`leads.list_call_button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.42_0.16_142)/10]"
                            onClick={() => onLogQuickActivity(lead, "Call")}
                            title="Log Call"
                            aria-label="Log Call"
                          >
                            <Phone className="size-3" />
                          </Button>
                          {/* Quick Message */}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`leads.list_message_button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-[oklch(0.52_0.18_240)] hover:bg-[oklch(0.52_0.18_240)/10]"
                            onClick={() => onLogQuickActivity(lead, "Message")}
                            title="Log Message"
                            aria-label="Log Message"
                          >
                            <MessageSquare className="size-3" />
                          </Button>
                          {/* Edit */}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`leads.list_edit_button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => onEdit(lead)}
                            title="Edit"
                            aria-label="Edit lead"
                          >
                            <Pencil className="size-3" />
                          </Button>
                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`leads.list_delete_button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(lead)}
                            title="Delete"
                            aria-label="Delete lead"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Showing {filtered.length} of {leads.length} leads
            </span>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmBulkDelete(false);
        }}
        title="Delete Selected Leads"
        description={`Are you sure you want to delete ${selectedIds.size} lead${selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={() => {
          onBulkDelete();
          setConfirmBulkDelete(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ActiveView = "pipeline" | "list" | "import";

export default function LeadsPage() {
  const {
    activeLeads,
    addLead,
    updateLead,
    deleteLead,
    archiveLead,
    addActivityEntry,
    saveClient,
  } = useLocalData();
  const { success } = useToast();

  const [view, setView] = useState<ActiveView>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const [importToast, setImportToast] = useState<number | null>(null);
  const draggingId = useRef<string | null>(null);

  // List view filter state — persists across view switches
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>("all");

  // Bulk selection — resets when switching views
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function handleViewChange(v: ActiveView) {
    setSelectedIds(new Set()); // reset bulk selection on view switch
    setView(v);
  }

  // Drag-and-drop handlers
  function handleDragStart(e: React.DragEvent, leadId: string) {
    draggingId.current = leadId;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  }

  function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    setDragOverCol(null);
    if (draggingId.current) {
      updateLead(draggingId.current, { status });
      draggingId.current = null;
    }
  }

  function handleDragEnd() {
    setDragOverCol(null);
    draggingId.current = null;
  }

  // Add/edit handlers
  function handleAddLead(
    data: Omit<Lead, "id" | "createdAt" | "archivedAt" | "activityLog">,
  ) {
    addLead(data);
    success("Lead added successfully");
  }

  function handleEditLead(
    data: Omit<Lead, "id" | "createdAt" | "archivedAt" | "activityLog">,
  ) {
    if (!editLead) return;
    updateLead(editLead.id, data);
    success("Lead updated successfully");
    setEditLead(null);
  }

  function handleDeleteConfirm() {
    if (!deletingLead) return;
    deleteLead(deletingLead.id);
    success("Lead deleted");
    setDeletingLead(null);
  }

  function handleLogActivity(
    leadId: string,
    type: ActivityEntry["type"],
    notes: string,
  ) {
    addActivityEntry(leadId, { type, notes });
  }

  // Quick activity log from list view — opens activity panel for the lead
  function handleQuickActivity(lead: Lead, _type: ActivityEntry["type"]) {
    setActivityLead(lead);
  }

  function handleConvertConfirm() {
    if (!convertingLead) return;
    saveClient({
      id: crypto.randomUUID(),
      name: convertingLead.name,
      phone: convertingLead.phone,
      email: convertingLead.email,
      businessName: convertingLead.companyName,
      notes: [],
      createdAt: Date.now(),
    });
    archiveLead(convertingLead.id);
    if (activityLead?.id === convertingLead.id) setActivityLead(null);
    success("Lead converted to client successfully");
    setConvertingLead(null);
  }

  // List view bulk actions
  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleSelectAll(ids: string[]) {
    const allSelected = ids.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  }

  function handleBulkDelete() {
    for (const id of selectedIds) {
      deleteLead(id);
    }
    success(
      `${selectedIds.size} lead${selectedIds.size !== 1 ? "s" : ""} deleted`,
    );
    setSelectedIds(new Set());
  }

  function handleBulkUpdateStatus(status: LeadStatus) {
    for (const id of selectedIds) {
      updateLead(id, { status });
    }
    success(
      `${selectedIds.size} lead${selectedIds.size !== 1 ? "s" : ""} updated`,
    );
    setSelectedIds(new Set());
  }

  // Group leads by status for kanban
  const byStatus = COLUMNS.reduce<Record<LeadStatus, Lead[]>>(
    (acc, col) => {
      acc[col.status] = activeLeads.filter((l) => l.status === col.status);
      return acc;
    },
    {} as Record<LeadStatus, Lead[]>,
  );

  const totalLeads = activeLeads.length;
  const overdueCount = activeLeads.filter(
    (l) => getFollowUpStatus(l.followUpDate) === "overdue",
  ).length;
  const todayCount = activeLeads.filter(
    (l) => getFollowUpStatus(l.followUpDate) === "today",
  ).length;
  const convertedCount = activeLeads.filter(
    (l) => l.status === "Converted",
  ).length;

  // Sync activityLead with updated lead data
  const liveActivityLead = activityLead
    ? (activeLeads.find((l) => l.id === activityLead.id) ?? activityLead)
    : null;

  const VIEW_TABS: {
    value: ActiveView;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { value: "list", label: "List", icon: LayoutList },
    { value: "pipeline", label: "Pipeline", icon: Rows3 },
    { value: "import", label: "Import", icon: Upload },
  ];

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      onDragEnd={handleDragEnd}
    >
      {/* Compact hero header */}
      <div className="gradient-hero px-5 pt-5 pb-4 shrink-0">
        <div className="max-w-screen-xl mx-auto">
          {/* Title + actions row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-white leading-tight">
                Lead Pipeline
              </h1>
              <p className="text-xs text-white/60 mt-0.5">
                Track, manage, and convert your leads
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                data-ocid="leads.add_button"
                className="gradient-accent text-white shadow-glow text-xs h-8"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-3.5 mr-1.5" />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Quick stats — compact */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Total", value: totalLeads, icon: Users },
              { label: "Today", value: todayCount, icon: Calendar },
              { label: "Overdue", value: overdueCount, icon: CalendarDays },
              { label: "Converted", value: convertedCount, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="size-3 text-white/50 shrink-0" />
                  <span className="text-[10px] text-white/50 truncate">
                    {label}
                  </span>
                </div>
                <p className="text-lg font-bold font-display text-white leading-tight mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 3-way view tabs */}
          <div className="flex gap-1 mt-4 bg-white/10 w-fit rounded-xl p-1">
            {VIEW_TABS.map(({ value: v, label, icon: Icon }) => (
              <button
                type="button"
                key={v}
                data-ocid={`leads.${v}_tab`}
                onClick={() => handleViewChange(v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  view === v
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/70 hover:text-white/90"
                }`}
              >
                <Icon className="size-3 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-background min-w-0 overflow-x-hidden">
        {view === "pipeline" ? (
          <div className="p-4 max-w-screen-xl mx-auto h-full">
            {totalLeads === 0 ? (
              <Card className="mt-4">
                <EmptyState
                  icon={Users}
                  title="No leads yet"
                  description="Add your first lead to start building your pipeline."
                  ctaLabel="Add Lead"
                  onCta={() => setAddOpen(true)}
                  data-ocid="leads.empty_state"
                />
              </Card>
            ) : (
              <div
                className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1"
                data-ocid="leads.kanban_board"
                style={{ scrollbarWidth: "thin" }}
              >
                {COLUMNS.map((col, ci) => (
                  <KanbanColumn
                    key={col.status}
                    col={col}
                    leads={byStatus[col.status]}
                    isDragOver={dragOverCol === col.status}
                    onDragOver={(e) => handleDragOver(e, col.status)}
                    onDrop={(e) => handleDrop(e, col.status)}
                    onEditLead={setEditLead}
                    onDeleteLead={setDeletingLead}
                    onActivityLead={setActivityLead}
                    onDragStartLead={handleDragStart}
                    colIndex={ci}
                  />
                ))}
              </div>
            )}
          </div>
        ) : view === "list" ? (
          <div
            className="px-4 py-4 max-w-screen-xl mx-auto"
            data-ocid="leads.list_section"
          >
            <LeadsListTable
              leads={activeLeads}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              followUpFilter={followUpFilter}
              onFollowUpFilterChange={setFollowUpFilter}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEdit={setEditLead}
              onDelete={setDeletingLead}
              onActivity={setActivityLead}
              onLogQuickActivity={handleQuickActivity}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateStatus={handleBulkUpdateStatus}
            />
          </div>
        ) : (
          <div
            className="px-5 py-5 max-w-screen-xl mx-auto"
            data-ocid="leads.import_view"
          >
            <LeadImportView
              activeLeads={activeLeads}
              onImport={(imported) => {
                for (const l of imported) addLead(l);
                setImportToast(imported.length);
                handleViewChange("list");
              }}
            />
          </div>
        )}
      </div>

      {/* Import success toast */}
      {importToast !== null && (
        <ImportToast
          count={importToast}
          onDismiss={() => setImportToast(null)}
        />
      )}

      {/* Modals */}
      <LeadFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleAddLead}
      />
      <LeadFormModal
        open={!!editLead}
        onOpenChange={(v) => {
          if (!v) setEditLead(null);
        }}
        initial={editLead}
        onSave={handleEditLead}
      />

      {liveActivityLead && (
        <ActivityPanel
          lead={liveActivityLead}
          open={!!activityLead}
          onOpenChange={(v) => {
            if (!v) setActivityLead(null);
          }}
          onLogActivity={(type, notes) =>
            handleLogActivity(liveActivityLead.id, type, notes)
          }
          onConvert={() => setConvertingLead(liveActivityLead)}
        />
      )}

      <ConfirmDialog
        open={!!deletingLead}
        onOpenChange={(v) => {
          if (!v) setDeletingLead(null);
        }}
        title="Delete Lead"
        description={`Are you sure you want to delete "${deletingLead?.name}"? This cannot be undone.`}
        confirmLabel="Delete Lead"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={!!convertingLead}
        onOpenChange={(v) => {
          if (!v) setConvertingLead(null);
        }}
        title="Convert to Client"
        description={`Convert "${convertingLead?.name}" to a client? The lead will be archived and their data copied to your Clients module.`}
        confirmLabel="Convert"
        onConfirm={handleConvertConfirm}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lead Import View (inline component)
// ---------------------------------------------------------------------------

type ImportStatus = "Pending" | "Approved" | "Rejected";
type ImportQuality = "High" | "Medium" | "Low";

interface ImportRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  quality: ImportQuality;
  importStatus: ImportStatus;
  isDuplicate: boolean;
  editing: boolean;
}

interface LeadImportViewProps {
  activeLeads: Lead[];
  onImport: (
    leads: Omit<Lead, "id" | "createdAt" | "archivedAt" | "activityLog">[],
  ) => void;
}

function parseCSV(
  text: string,
): Omit<
  ImportRow,
  "id" | "quality" | "importStatus" | "isDuplicate" | "editing"
>[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));
  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
      const get = (keys: string[]) => {
        for (const k of keys) {
          const i = headers.indexOf(k);
          if (i !== -1 && cols[i]) return cols[i];
        }
        return "";
      };
      return {
        name: get(["name", "fullname", "full_name"]),
        phone: get(["phone", "phonenumber", "phone_number", "mobile"]),
        email: get(["email", "emailaddress", "email_address"]),
        companyName: get([
          "company",
          "companyname",
          "company_name",
          "business",
        ]),
      };
    })
    .filter((r) => r.name || r.email || r.phone);
}

function scoreQuality(
  row: Pick<ImportRow, "name" | "phone" | "email" | "companyName">,
): ImportQuality {
  let score = 0;
  if (row.name) score++;
  if (row.phone) score++;
  if (row.email) score++;
  if (row.companyName) score++;
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

function LeadImportView({ activeLeads, onImport }: LeadImportViewProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [draggingFile, setDraggingFile] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  function isDuplicate(phone: string, email: string): boolean {
    return activeLeads.some(
      (l) => (phone && l.phone === phone) || (email && l.email === email),
    );
  }

  function processFile(file: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      const mapped: ImportRow[] = parsed.map((p) => ({
        id: crypto.randomUUID(),
        ...p,
        quality: scoreQuality(p),
        importStatus: "Pending",
        isDuplicate: isDuplicate(p.phone, p.email),
        editing: false,
      }));
      setRows(mapped);
      setSelectedIds(new Set());
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function setStatus(id: string, status: ImportStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, importStatus: status } : r)),
    );
  }

  function toggleEdit(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, editing: !r.editing } : r)),
    );
  }

  function updateField(
    id: string,
    field: "name" | "phone" | "email" | "companyName",
    val: string,
  ) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: val };
        return {
          ...updated,
          isDuplicate: isDuplicate(updated.phone, updated.email),
          quality: scoreQuality(updated),
        };
      }),
    );
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  }

  function bulkApprove() {
    if (selectedIds.size === 0) return;
    setRows((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, importStatus: "Approved" } : r,
      ),
    );
  }

  function bulkReject() {
    if (selectedIds.size === 0) return;
    setRows((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, importStatus: "Rejected" } : r,
      ),
    );
  }

  function handleImport() {
    const approved = rows.filter((r) => r.importStatus === "Approved");
    if (approved.length === 0) return;
    onImport(
      approved.map((r) => ({
        name: r.name,
        phone: r.phone,
        email: r.email,
        companyName: r.companyName,
        source: "Other" as LeadSource,
        status: "New" as LeadStatus,
        notes: "",
        followUpDate: null,
      })),
    );
  }

  const approvedCount = rows.filter(
    (r) => r.importStatus === "Approved",
  ).length;
  const dupCount = rows.filter((r) => r.isDuplicate).length;
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0;

  const qualityColors: Record<ImportQuality, string> = {
    High: "bg-[oklch(0.92_0.06_142)] text-[oklch(0.32_0.14_142)]",
    Medium: "bg-[oklch(0.94_0.06_55)]  text-[oklch(0.35_0.15_55)]",
    Low: "bg-[oklch(0.94_0.06_25)]  text-[oklch(0.35_0.15_25)]",
  };

  const statusColors: Record<ImportStatus, string> = {
    Pending: "bg-muted text-muted-foreground",
    Approved: "bg-[oklch(0.92_0.06_142)] text-[oklch(0.32_0.14_142)]",
    Rejected: "bg-[oklch(0.94_0.06_25)]  text-[oklch(0.35_0.15_25)]",
  };

  return (
    <div className="space-y-5" data-ocid="import.section">
      {rows.length === 0 ? (
        <button
          type="button"
          data-ocid="import.dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingFile(true);
          }}
          onDragLeave={() => setDraggingFile(false)}
          onDrop={handleFileDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all w-full ${
            draggingFile
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-border hover:border-accent/50 hover:bg-muted/20"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="import.file_input"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                Drop your CSV file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse · supports .csv files
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground/70 max-w-sm">
              Columns: name, phone, email, company. Headers are auto-detected.
            </p>
          </div>
        </button>
      ) : (
        <>
          {/* Summary + toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {rows.length} leads loaded
              </span>
              {dupCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.94_0.06_55)] text-[oklch(0.35_0.15_55)] font-medium">
                  {dupCount} duplicates
                </span>
              )}
              {approvedCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.92_0.06_142)] text-[oklch(0.32_0.14_142)] font-medium">
                  {approvedCount} approved
                </span>
              )}
              {someSelected && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {selectedIds.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                data-ocid="import.approve_selected_button"
                onClick={bulkApprove}
                disabled={!someSelected}
                className="text-xs h-8"
              >
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                data-ocid="import.reject_selected_button"
                onClick={bulkReject}
                disabled={!someSelected}
                className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Reject Selected
              </Button>
              <Button
                size="sm"
                data-ocid="import.import_button"
                onClick={handleImport}
                disabled={approvedCount === 0}
                className="text-xs h-8 gradient-accent text-white shadow-glow"
              >
                Import{" "}
                {approvedCount > 0 ? `${approvedCount} Approved` : "Leads"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-ocid="import.clear_button"
                onClick={() => {
                  setRows([]);
                  setSelectedIds(new Set());
                }}
                className="text-xs h-8 text-muted-foreground"
              >
                <X className="size-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Table */}
          <div
            className="rounded-xl border border-border overflow-hidden"
            data-ocid="import.table"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="w-10 px-3 py-2.5 text-left">
                      <Checkbox
                        data-ocid="import.select_all_checkbox"
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all rows"
                      />
                    </th>
                    {[
                      "Name",
                      "Phone",
                      "Email",
                      "Company",
                      "Quality",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      data-ocid={`import.row.${i + 1}`}
                      className={`bg-card hover:bg-muted/20 transition-colors ${
                        row.isDuplicate ? "bg-[oklch(0.94_0.06_55)/20]" : ""
                      } ${selectedIds.has(row.id) ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-3 py-2.5">
                        <Checkbox
                          data-ocid={`import.select_checkbox.${i + 1}`}
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => toggleSelectRow(row.id)}
                          aria-label={`Select row ${i + 1}`}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {row.editing ? (
                          <Input
                            value={row.name}
                            onChange={(e) =>
                              updateField(row.id, "name", e.target.value)
                            }
                            className="h-7 text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-xs">
                              {row.name}
                            </span>
                            {row.isDuplicate && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[oklch(0.94_0.06_55)] text-[oklch(0.35_0.15_55)] font-bold">
                                DUP
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">
                        {row.editing ? (
                          <Input
                            value={row.phone}
                            onChange={(e) =>
                              updateField(row.id, "phone", e.target.value)
                            }
                            className="h-7 text-xs"
                          />
                        ) : (
                          row.phone || "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">
                        {row.editing ? (
                          <Input
                            value={row.email}
                            onChange={(e) =>
                              updateField(row.id, "email", e.target.value)
                            }
                            className="h-7 text-xs"
                          />
                        ) : (
                          row.email || "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">
                        {row.editing ? (
                          <Input
                            value={row.companyName}
                            onChange={(e) =>
                              updateField(row.id, "companyName", e.target.value)
                            }
                            className="h-7 text-xs"
                          />
                        ) : (
                          row.companyName || "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${qualityColors[row.quality]}`}
                        >
                          {row.quality}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[row.importStatus]}`}
                        >
                          {row.importStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {row.importStatus !== "Approved" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`import.approve_button.${i + 1}`}
                              onClick={() => setStatus(row.id, "Approved")}
                              className="h-7 px-2 text-xs text-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.52_0.18_142)/10]"
                            >
                              Approve
                            </Button>
                          )}
                          {row.importStatus !== "Rejected" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`import.reject_button.${i + 1}`}
                              onClick={() => setStatus(row.id, "Rejected")}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`import.edit_button.${i + 1}`}
                            onClick={() => toggleEdit(row.id)}
                            className={`h-7 w-7 p-0 ${row.editing ? "bg-accent/15 text-accent" : "text-muted-foreground"}`}
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
