import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
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
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/useToast";
import type { Client } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Mail,
  Pencil,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

const EMPTY_CLIENT: Omit<Client, "id" | "notes" | "createdAt"> = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
};

/** Gradient backgrounds for client avatars — cycles through a set of palettes */
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

function formatCurrency(amount: number) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toLocaleString("en-US")}`;
}

export function ClientsPage() {
  const navigate = useNavigate();
  const { clients, projects, saveClient, deleteClient } = useLocalData();
  const { success, error } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

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

  /** Revenue earned per client (sum of paid amounts across all their projects) */
  function getClientRevenue(clientId: string) {
    return projects
      .filter((p) => p.clientId === clientId)
      .reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);
  }

  function getProjectCount(clientId: string) {
    return projects.filter((p) => p.clientId === clientId).length;
  }

  return (
    <div className="space-y-0" data-ocid="clients.page">
      {/* ── Premium Gradient Hero Header ────────────────────────────────────── */}
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
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 page-fade-in">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="clients.search_input"
            placeholder="Search by name, business, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border focus:ring-1 focus:ring-ring transition-shadow"
          />
        </div>

        {/* Client Grid */}
        {filtered.length === 0 ? (
          <Card data-ocid="clients.empty_state">
            <EmptyState
              icon={Users}
              title={search ? "No clients match your search" : "No clients yet"}
              description={
                search
                  ? "Try a different name or email address."
                  : "Add your first client to get started managing your agency."
              }
              ctaLabel={search ? undefined : "Add Client"}
              onCta={search ? undefined : openAdd}
            />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client, i) => {
              const revenue = getClientRevenue(client.id);
              const projectCount = getProjectCount(client.id);
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
                    <div className="flex items-center gap-1.5">
                      <div className="size-5 rounded-md bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="size-3 text-emerald-600" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(revenue)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        revenue
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {projectCount}{" "}
                      {projectCount === 1 ? "project" : "projects"}
                    </span>
                  </div>

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

        {/* Floating Action Button */}
        <FloatingActionButton
          data-ocid="clients.fab_add_button"
          onClick={openAdd}
          label="Add Client"
        />

        {/* Add / Edit Dialog */}
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
