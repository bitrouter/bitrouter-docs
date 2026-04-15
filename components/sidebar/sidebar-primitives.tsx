"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

// ── Context ──────────────────────────────────────────────

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change / escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ── Layout (two-column with responsive sidebar) ──────────

export function SidebarLayout({
  sidebar,
  children,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className={cn("flex h-[calc(100vh-3.5rem)] overflow-hidden", className)}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside
        className={cn(
          "fixed inset-y-14 left-0 z-50 flex flex-col border-r border-border bg-background transition-transform duration-200 lg:static lg:inset-auto lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ── Sidebar Shell ────────────────────────────────────────
// The sidebar container. Handles collapsed state.

export function SidebarShell({
  children,
  width = "w-60",
  className,
}: {
  children: ReactNode;
  width?: string;
  className?: string;
}) {
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className="flex h-full w-10 shrink-0 flex-col items-center border-r border-border py-3">
        <SidebarExpandButton />
      </div>
    );
  }

  return (
    <div className={cn(width, "flex h-full shrink-0 flex-col", className)}>
      {children}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────

export function SidebarHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      {children}
    </div>
  );
}

// ── Scrollable content area ──────────────────────────────

export function SidebarBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-4 py-3", className)}>
      {children}
    </div>
  );
}

// ── Section (labeled group of items) ─────────────────────

export function SidebarSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      {title && (
        <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

// ── Separator ────────────────────────────────────────────

export function SidebarSeparator({ className }: { className?: string }) {
  return <div className={cn("my-3 h-px bg-border", className)} />;
}

// ── Nav Item (link) ──────────────────────────────────────

export function SidebarNavItem({
  href,
  active,
  icon,
  children,
  external,
  className,
  onClick,
}: {
  href: string;
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = external ? "a" : "a";
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-[13px] transition-colors",
        active
          ? "border-l-2 border-foreground bg-muted/50 pl-[calc(0.5rem-2px)] font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
        className,
      )}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      {children}
    </a>
  );
}

// ── Collapsible Folder ───────────────────────────────────

export function SidebarFolder({
  title,
  icon,
  defaultOpen = false,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("mb-1", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {icon && <span className="size-4 shrink-0">{icon}</span>}
        <span className="flex-1 text-left">{title}</span>
        <svg
          className={cn("size-3 transition-transform", open && "rotate-90")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {open && <div className="ml-3 border-l border-border/50 pl-2">{children}</div>}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────

export function SidebarFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-auto flex items-center gap-2 border-t border-border px-4 py-3", className)}>
      {children}
    </div>
  );
}

// ── Utility buttons ──────────────────────────────────────

export function SidebarCollapseButton() {
  const { setCollapsed } = useSidebar();
  return (
    <button
      onClick={() => setCollapsed(true)}
      className="p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      title="Collapse sidebar"
    >
      <PanelLeftClose className="size-3.5" />
    </button>
  );
}

export function SidebarExpandButton() {
  const { setCollapsed } = useSidebar();
  return (
    <button
      onClick={() => setCollapsed(false)}
      className="p-1 text-muted-foreground transition-colors hover:text-foreground"
      title="Expand sidebar"
    >
      <PanelLeftOpen className="size-4" />
    </button>
  );
}

export function SidebarMobileTrigger({ className }: { className?: string }) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className={cn("p-1.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden", className)}
      aria-label="Toggle sidebar"
    >
      {mobileOpen ? <X className="size-5" /> : <PanelLeftOpen className="size-5" />}
    </button>
  );
}

export function SidebarMobileClose() {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(false)}
      className="p-0.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
    >
      <X className="size-4" />
    </button>
  );
}
