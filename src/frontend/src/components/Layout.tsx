import { Toaster } from "@/components/ui/sonner";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Briefcase,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  { to: "/clients", label: "Clients", icon: Users, ocid: "nav.clients_link" },
  {
    to: "/projects",
    label: "Projects",
    icon: FolderOpen,
    ocid: "nav.projects_link",
  },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Briefcase className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-sidebar-foreground text-base tracking-tight">
            Agency CRM
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth ${
                isActive(to)
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border flex items-center justify-between px-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary flex items-center justify-center">
            <Briefcase className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground text-sm">
            Agency CRM
          </span>
        </div>
        <button
          type="button"
          data-ocid="nav.mobile_menu_toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="size-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false);
          }}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-sidebar border-r border-border transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth ${
                isActive(to)
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="size-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <div className="flex-1 pt-14 md:pt-0">{children}</div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
