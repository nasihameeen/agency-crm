import { Toaster } from "@/components/ui/sonner";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  {
    to: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    ocid: "nav.tasks_link",
  },
  {
    to: "/finance",
    label: "Finance",
    icon: DollarSign,
    ocid: "nav.finance_link",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    ocid: "nav.analytics_link",
  },
  {
    to: "/leads",
    label: "Leads",
    icon: Target,
    ocid: "nav.leads_link",
  },
];

const STORAGE_KEY = "sidebar_collapsed";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  // Tooltip state: which nav item label is being hovered (collapsed mode only)
  const [tooltipLabel, setTooltipLabel] = useState<string | null>(null);
  const tooltipRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Close tooltip when expanding sidebar
  useEffect(() => {
    if (!collapsed) setTooltipLabel(null);
  }, [collapsed]);

  const sidebarWidth = collapsed ? "w-[4.5rem]" : "w-60";
  const mainMargin = collapsed ? "md:ml-[4.5rem]" : "md:ml-60";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col ${sidebarWidth} flex-shrink-0 fixed inset-y-0 left-0 z-30 bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden`}
      >
        {/* Top gradient accent bar */}
        <div className="h-0.5 w-full gradient-accent flex-shrink-0" />

        {/* Branding header + collapse toggle */}
        <div
          className={`flex items-center h-16 border-b border-sidebar-border flex-shrink-0 relative ${collapsed ? "justify-center px-0" : "gap-3 px-5"}`}
        >
          <div className="size-8 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Briefcase className="size-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight tracking-tight">
                AgencyOS
              </p>
              <p className="text-[10px] text-sidebar-muted leading-tight font-body">
                Management Suite
              </p>
            </div>
          )}

          {/* Collapse toggle button — desktop only */}
          <button
            type="button"
            data-ocid="nav.sidebar_collapse_toggle"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`size-6 rounded-lg flex items-center justify-center border border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-smooth flex-shrink-0 ${collapsed ? "absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 shadow-premium" : ""}`}
          >
            {collapsed ? (
              <ChevronRight className="size-3" />
            ) : (
              <ChevronLeft className="size-3" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => {
            const active = isActive(to);
            return (
              <div
                key={to}
                className="relative"
                onMouseEnter={() => collapsed && setTooltipLabel(label)}
                onMouseLeave={() => setTooltipLabel(null)}
                ref={(el) => {
                  if (el) tooltipRefs.current.set(label, el);
                  else tooltipRefs.current.delete(label);
                }}
              >
                <Link
                  to={to}
                  data-ocid={ocid}
                  className={`group flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth relative ${
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground shadow-inner-glow"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary" />
                  )}
                  <Icon
                    className={`size-4 flex-shrink-0 transition-smooth ${
                      active
                        ? "text-sidebar-primary"
                        : "text-sidebar-muted group-hover:text-sidebar-accent-foreground"
                    }`}
                  />
                  {!collapsed && (
                    <>
                      {label}
                      {active && (
                        <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary flex-shrink-0" />
                      )}
                    </>
                  )}
                </Link>

                {/* Tooltip — collapsed mode only */}
                {collapsed && tooltipLabel === label && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
                    <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-premium whitespace-nowrap">
                      {label}
                    </div>
                    {/* Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!collapsed ? (
          <div className="px-4 pt-3 pb-4 border-t border-sidebar-border flex-shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-sidebar-accent/50 mb-3">
              <div className="size-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Zap className="size-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground leading-tight truncate">
                  Agency Plan
                </p>
                <p className="text-[10px] text-sidebar-muted leading-tight">
                  All features active
                </p>
              </div>
            </div>
            <p className="text-[10px] text-sidebar-muted text-center leading-relaxed">
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sidebar-foreground transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        ) : (
          <div className="px-2 pt-3 pb-4 border-t border-sidebar-border flex-shrink-0 flex justify-center">
            <div className="size-7 rounded-full gradient-primary flex items-center justify-center">
              <Zap className="size-3.5 text-white" />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 shadow-premium">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg gradient-accent flex items-center justify-center shadow-glow-sm">
            <Briefcase className="size-3.5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-none">
              AgencyOS
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="nav.mobile_menu_toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="size-9 flex items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-smooth"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
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
        className={`md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-0.5 w-full gradient-accent flex-shrink-0" />
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                data-ocid={ocid}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth relative ${
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary" />
                )}
                <Icon
                  className={`size-4 flex-shrink-0 ${
                    active ? "text-sidebar-primary" : "text-sidebar-muted"
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content — margin adjusts with sidebar collapse */}
      <main
        className={`flex-1 ${mainMargin} flex flex-col min-h-screen overflow-x-hidden min-w-0 transition-all duration-300`}
      >
        <div className="flex-1 pt-14 md:pt-0 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
