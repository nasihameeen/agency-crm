import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

const EMPTY_CLIENT: Omit<Client, "id" | "notes" | "createdAt"> = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
};

export function ClientsPage() {
  const navigate = useNavigate();
  const { clients, saveClient, deleteClient } = useLocalData();
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

  return (
    <div className="p-6 space-y-6" data-ocid="clients.page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} total
          </p>
        </div>
        <Button
          data-ocid="clients.add_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="size-4" /> Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          data-ocid="clients.search_input"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12" data-ocid="clients.empty_state">
          <Users className="size-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No clients yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add your first client to get started.
          </p>
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="size-4" /> Add Client
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, i) => (
            <Card
              key={client.id}
              hoverable
              onClick={() =>
                navigate({ to: "/clients/$id", params: { id: client.id } })
              }
              data-ocid={`clients.item.${i + 1}`}
              className="group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="text-sm font-bold text-primary">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground truncate">
                    {client.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {client.businessName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {client.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.phone}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
              </div>
              <div
                className="flex items-center gap-1 mt-4 pt-3 border-t border-border"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <Button
                  data-ocid={`clients.edit_button.${i + 1}`}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
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
                  className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(client);
                  }}
                >
                  <Trash2 className="size-3" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
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
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
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
  );
}
