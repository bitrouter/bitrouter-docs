"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ── Types (compatible with fumadocs PageTree) ────────────

export interface NavTreeRoot {
  name: string;
  children: NavTreeNode[];
}

export type NavTreeNode = NavTreeItem | NavTreeFolder | NavTreeSeparator;

export interface NavTreeItem {
  type: "page";
  name: string;
  url: string;
  icon?: React.ReactNode;
  external?: boolean;
  description?: string;
}

export interface NavTreeFolder {
  type: "folder";
  name: string;
  icon?: React.ReactNode;
  index?: NavTreeItem;
  children: NavTreeNode[];
  defaultOpen?: boolean;
}

export interface NavTreeSeparator {
  type: "separator";
  name?: string;
}

// ── Tree renderer ────────────────────────────────────────

export function SidebarNavTree({ tree }: { tree: NavTreeRoot }) {
  return (
    <nav className="space-y-0.5">
      {tree.children.map((node, i) => (
        <NavNode key={i} node={node} depth={0} />
      ))}
    </nav>
  );
}

function NavNode({ node, depth }: { node: NavTreeNode; depth: number }) {
  switch (node.type) {
    case "page":
      return <NavItem item={node} depth={depth} />;
    case "folder":
      return <NavFolder folder={node} depth={depth} />;
    case "separator":
      return <NavSeparator separator={node} />;
  }
}

function NavItem({ item, depth }: { item: NavTreeItem; depth: number }) {
  const pathname = usePathname();
  // Strip locale prefix for comparison
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = normalizedPath === item.url || normalizedPath === item.url + "/";

  const linkProps = item.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={item.url}
      {...linkProps}
      className={cn(
        "group flex items-center gap-2 py-1.5 text-[13px] transition-colors",
        depth === 0 ? "px-2" : "px-2",
        isActive
          ? "border-l-2 border-foreground bg-muted/50 font-medium text-foreground pl-[calc(0.5rem-2px)]"
          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
      )}
    >
      {item.icon && <span className="size-4 shrink-0 opacity-70">{item.icon}</span>}
      <span className="truncate">{item.name}</span>
      {item.external && (
        <svg className="ml-auto size-3 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 7h10v10" /><path d="M7 17 17 7" />
        </svg>
      )}
    </Link>
  );
}

function NavFolder({ folder, depth }: { folder: NavTreeFolder; depth: number }) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";

  // Auto-open if any child is active
  const hasActiveChild = folderContainsPath(folder, normalizedPath);
  const [open, setOpen] = useState(folder.defaultOpen ?? hasActiveChild);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 py-1.5 text-[13px] transition-colors",
          depth === 0 ? "px-2" : "px-2",
          hasActiveChild
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {folder.icon && <span className="size-4 shrink-0 opacity-70">{folder.icon}</span>}
        <span className="flex-1 truncate text-left">{folder.name}</span>
        <svg
          className={cn("size-3 shrink-0 transition-transform duration-150", open && "rotate-90")}
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

      {open && (
        <div className="ml-3 border-l border-border/50 pl-1">
          {folder.index && <NavItem item={folder.index} depth={depth + 1} />}
          {folder.children.map((child, i) => (
            <NavNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function NavSeparator({ separator }: { separator: NavTreeSeparator }) {
  if (separator.name) {
    return (
      <div className="pb-1 pt-4 first:pt-0">
        <span className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {separator.name}
        </span>
      </div>
    );
  }
  return <div className="my-2 h-px bg-border/50" />;
}

// ── Helpers ──────────────────────────────────────────────

function folderContainsPath(folder: NavTreeFolder, path: string): boolean {
  if (folder.index && (path === folder.index.url || path === folder.index.url + "/")) return true;
  return folder.children.some((child) => {
    if (child.type === "page") return path === child.url || path === child.url + "/";
    if (child.type === "folder") return folderContainsPath(child, path);
    return false;
  });
}
