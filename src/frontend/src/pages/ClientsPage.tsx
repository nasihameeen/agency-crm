import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Badge } from "@/components/ui/badge";
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
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/useToast";
import type { Client, Project } from "@/types";
import { formatCurrency } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Mail,
  Pencil,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = "list" | "cards";
type ActivityFilter = "all" | "recent" | "inactive";

// ─── Constants ──────────────────────────────────────────────────────────────

const EMPTY_CLIENT: Omit<Client, "id" | "notes" | "createdAt"> = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-indigo-500 to-blue-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-pink-500 to-rose-600",
];

function getAvatarGradient(index: number) {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
}

// ─── Revenue helpers ─────────────────────────────────────────────────────────

interface RevenueBreakdown {
  inr: number;
  usd: number;
}

function getClientRevenueBreakdown(
  clientId: string,
  projects: Project[],
): RevenueBreakdown {
  const clientProjects = projects.filter((p) => p.clientId === clientId);
  const inr = clientProjects
    .filter((p) => (p.paidCurrency ?? "INR") === "INR")
    .reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);
  const usd = clientProjects
    .filter((p) => p.paidCurrency === "USD")
    .reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);
  return { inr, usd };
}

function formatRevenue(
  breakdown: RevenueBreakdown,
  projectCount: number,
): string {
  if (projectCount === 0) return formatCurrency(0, "INR");
  const { inr, usd } = breakdown;
  const hasInr = inr > 0;
  const hasUsd = usd > 0;
  if (hasInr && hasUsd)
    return `${formatCurrency(inr, "INR")} + ${formatCurrency(usd, "USD")}`;
  if (hasUsd) return formatCurrency(usd, "USD");
  return formatCurrency(inr, "INR");
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatRelativeDate(ts: number | undefined): string {
  if (!ts) return "No activity";
  const now = Date.now();
  const diffMs = now - ts;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${Math.floor(diffMonths / 12)} year${Math.floor(diffMonths / 12) > 1 ? "s" : ""} ago`;
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

function sortByActivity(a: Client, b: Client): number {
  const aTs = a.lastActivityAt ?? 0;
  const bTs = b.lastActivityAt ?? 0;
  // Clients with no activity go last
  if (aTs === 0 && bTs === 0) return 0;
  if (aTs === 0) return 1;
  if (bTs === 0) return -1;
  return bTs - aTs; // most recent first
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClientsPage() {
  const navigate = useNavigate();
  const { clients, projects, saveClient, deleteClient } = useLocalData();
  const { success, error } = useToast();

  // View + filter state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const filtered = clients
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.businessName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (activityFilter === "recent") {
        return c.lastActivityAt && now - c.lastActivityAt <= thirtyDaysMs;
      }
      if (activityFilter === "inactive") {
        return !c.lastActivityAt || now - c.lastActivityAt > thirtyDaysMs;
      }
      return true;
    })
    .sort(sortByActivity);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getProjectCount(clientId: string) {
    return projects.filter((p) => p.clientId === clientId).length;
  }

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_CLIENT);
    setDialogOpen(true);
  }

  function openEdit(c: Client) {
    setEditTarget(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      businessName: c.businessName,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      error("Name is required");
      return;
    }
    saveClient(
      editTarget
        ? { ...editTarget, ...form }
        : {
            ...form,
            id: crypto.randomUUID(),
            notes: [],
            createdAt: Date.now(),
          },
    );
    success(editTarget ? "Client updated" : "Client added");
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteClient(deleteTarget.id);
    success("Client deleted");
    setDeleteTarget(null);
  }

  // ── Derived stats for header ───────────────────────────────────────────────
  const recentClients = clients.filter(
    (c) => c.lastActivityAt && now - c.lastActivityAt <= thirtyDaysMs,
  ).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0" data-ocid="clients.page">
      {/* ── Premium Gradient Hero Header ──────────────────────────────────── */}
      <div
        className="gradient-header px-6 py-8 md:py-10"
        data-ocid="clients.hero.section"
      >
        <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
          Client Management
        </p>
        <h1 className="text-3xl font-display font-bold text-white leading-tight">
          Clients
        </h1>
        <p className="text-indigo-200/80 mt-1 text-sm">
          Manage your agency clients
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Total Clients
            </p>
            <p
              className="text-2xl font-display font-bold text-white mt-0.5"
              data-ocid="clients.total_count"
            >
              {clients.length}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Total Projects
            </p>
            <p className="text-2xl font-display font-bold text-sky-300 mt-0.5">
              {projects.length}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wide">
              Active (30d)
            </p>
            <p className="text-2xl font-display font-bold text-emerald-300 mt-0.5">
              {recentClients}
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-4 page-fade-in">
        {/* ── Toolbar row ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="clients.search_input"
              placeholder="Search by name, business, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border focus:ring-1 focus:ring-ring transition-shadow"
            />
          </div>

          {/* Activity filter */}
          <Select
            value={activityFilter}
            onValueChange={(v) => setActivityFilter(v as ActivityFilter)}
          >
            <SelectTrigger
              data-ocid="clients.activity_filter.select"
              className="w-[160px] bg-card border-border"
            >
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="recent">Recent (30d)</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg border border-border bg-card p-1 gap-0.5"
            data-ocid="clients.view_toggle"
          >
            <button
              type="button"
              data-ocid="clients.list_view.tab"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-fast ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="size-3.5" />
              List
            </button>
            <button
              type="button"
              data-ocid="clients.cards_view.tab"
              onClick={() => setViewMode("cards")}
              aria-label="Cards view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-fast ${
                viewMode === "cards"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Cards
            </button>
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <Card data-ocid="clients.empty_state">
            <EmptyState
              icon={Users}
              title={
                search || activityFilter !== "all"
                  ? "No clients match your filters"
                  : "No clients yet"
              }
              description={
                search || activityFilter !== "all"
                  ? "Try adjusting your search or filter settings."
                  : "Add your first client to get started managing your agency."
              }
              ctaLabel={
                search || activityFilter !== "all" ? undefined : "Add Client"
              }
              onCta={search || activityFilter !== "all" ? undefined : openAdd}
            />
          </Card>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
        {filtered.length > 0 && viewMode === "list" && (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Client
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Business
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Email
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Projects
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Revenue
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Last Activity
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((client, i) => {
                    const projectCount = getProjectCount(client.id);
                    const breakdown = getClientRevenueBreakdown(
                      client.id,
                      projects,
                    );
                    const revenueLabel = formatRevenue(breakdown, projectCount);
                    const relativeDate = formatRelativeDate(
                      client.lastActivityAt,
                    );
                    const isActive =
                      client.lastActivityAt &&
                      now - client.lastActivityAt <= thirtyDaysMs;

                    const goToClient = () =>
                      navigate({
                        to: "/clients/$id",
                        params: { id: client.id },
                      });

                    return (
                      <tr
                        key={client.id}
                        data-ocid={`clients.item.${i + 1}`}
                        className="group hover:bg-muted/30 transition-fast cursor-pointer"
                        onClick={goToClient}
                        onKeyDown={(e) => e.key === "Enter" && goToClient()}
                        tabIndex={0}
                      >
                        {/* Client Name + Avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`size-8 rounded-lg bg-gradient-to-br ${getAvatarGradient(i)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                            >
                              <span className="text-xs font-bold text-white select-none">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[140px]">
                              {client.name}
                            </span>
                          </div>
                        </td>

                        {/* Business Name */}
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                          {client.businessName || (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {client.phone || (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">
                          <div className="flex items-center gap-1">
                            {client.email ? (
                              <>
                                <Mail className="size-3 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground/40">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Project count */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                            {projectCount}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                          {revenueLabel}
                        </td>

                        {/* Last Activity */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-xs font-normal ${
                              isActive
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30"
                                : client.lastActivityAt
                                  ? "border-border text-muted-foreground"
                                  : "border-border text-muted-foreground/60"
                            }`}
                          >
                            {relativeDate}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                            <Button
                              data-ocid={`clients.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              aria-label={`Edit ${client.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(client);
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              data-ocid={`clients.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                              aria-label={`Delete ${client.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(client);
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                            <Button
                              data-ocid={`clients.view_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              aria-label={`View ${client.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({
                                  to: "/clients/$id",
                                  params: { id: client.id },
                                });
                              }}
                            >
                              <ChevronRight className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Row count footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filtered.length} client{filtered.length !== 1 ? "s" : ""}
                {activityFilter !== "all" || search
                  ? ` (filtered from ${clients.length})`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Sorted by most recent activity
              </p>
            </div>
          </div>
        )}

        {/* ── CARDS VIEW ────────────────────────────────────────────────── */}
        {filtered.length > 0 && viewMode === "cards" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client, i) => {
              const projectCount = getProjectCount(client.id);
              const breakdown = getClientRevenueBreakdown(client.id, projects);
              const revenueLabel = formatRevenue(breakdown, projectCount);
              const gradient = getAvatarGradient(i);

              return (
                <Card
                  key={client.id}
                  variant="premium"
                  hoverable
                  onClick={() =>
                    navigate({ to: "/clients/$id", params: { id: client.id } })
                  }
                  data-ocid={`clients.item.${i + 1}`}
                  className="group animate-item-in"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className={`size-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-elevated`}
                      >
                        <span className="text-base font-bold text-white select-none">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Name + Business */}
                      <h3 className="font-semibold text-foreground truncate leading-tight">
                        {client.name}
                      </h3>
                      {client.businessName && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {client.businessName}
                        </p>
                      )}

                      {/* Email */}
                      {client.email && (
                        <div className="flex items-center gap-1 mt-2">
                          <Mail className="size-3 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">
                            {client.email}
                          </p>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>

                  {/* Revenue + Projects row */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="size-5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {revenueLabel}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 flex-shrink-0">
                      {projectCount}{" "}
                      {projectCount === 1 ? "project" : "projects"}
                    </span>
                  </div>

                  {/* Last activity */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatRelativeDate(client.lastActivityAt)}
                  </p>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 mt-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="presentation"
                  >
                    <Button
                      data-ocid={`clients.edit_button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(client);
                      }}
                    >
                      <Pencil className="size-3" /> Edit
                    </Button>
                    <Button
                      data-ocid={`clients.delete_button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/5 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(client);
                      }}
                    >
                      <Trash2 className="size-3" /> Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Floating Action Button ────────────────────────────────────── */}
        <FloatingActionButton
          data-ocid="clients.fab_add_button"
          onClick={openAdd}
          label="Add Client"
        />

        {/* ── Add / Edit Dialog ─────────────────────────────────────────── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-ocid="clients.dialog">
            <DialogHeader>
              <DialogTitle>
                {editTarget ? "Edit Client" : "Add Client"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {(["name", "businessName", "email", "phone"] as const).map(
                (field) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field} className="capitalize">
                      {field === "businessName"
                        ? "Business Name"
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                      {field === "name" && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      id={field}
                      data-ocid={`clients.${field}_input`}
                      value={form[field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                            ? "tel"
                            : "text"
                      }
                    />
                  </div>
                ),
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                data-ocid="clients.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button data-ocid="clients.submit_button" onClick={handleSave}>
                {editTarget ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          title="Delete Client"
          description={`Are you sure you want to delete ${deleteTarget?.name}? All their projects will also be removed.`}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
