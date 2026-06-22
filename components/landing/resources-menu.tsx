"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  GitBranch,
  Palette,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { SOCIAL_LINKS } from "./social-links";

type ResourceItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const RESOURCE_ITEMS: ResourceItem[] = [
  { label: "Blog", description: "Engineering, product, and updates", href: "/blog", icon: FileText },
  { label: "Enterprise", description: "Dedicated infra, residency, SLAs", href: "/enterprise", icon: Building2 },
  { label: "Changelog", description: "Latest releases and improvements", href: "/changelog", icon: GitBranch },
  { label: "About", description: "Who we are", href: "/about", icon: Users },
  { label: "Brand", description: "Logos and guidelines", href: "/brand", icon: Palette },
  { label: "Privacy", description: "Privacy policy", href: "/legal/privacy", icon: Scale },
  { label: "Terms", description: "Terms of service", href: "/legal/terms", icon: Scale },
];

const RESOURCE_PREFIXES = RESOURCE_ITEMS.map((i) => i.href);

// Mirrors fumadocs notebook's NavbarLinkItemMenu hover-with-freeze pattern,
// so we get Radix Popover's Portal (escapes the docs header's z-10 stacking
// context) while keeping the hover-to-open feel of the previous NavigationMenu.
const HOVER_DELAY_MS = 50;
const STATE_FREEZE_MS = 300;

export function ResourcesTabCell() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = RESOURCE_PREFIXES.some((p) => normalizedPath.startsWith(p));

  const [featuredA, featuredB, ...secondary] = RESOURCE_ITEMS;

  const [open, setOpen] = useState(false);
  const hoverTimeout = useRef<number | null>(null);
  const freezeUntil = useRef<number | null>(null);

  const delaySetOpen = (value: boolean) => {
    if (hoverTimeout.current !== null) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    hoverTimeout.current = window.setTimeout(() => {
      setOpen(value);
      freezeUntil.current = Date.now() + STATE_FREEZE_MS;
    }, HOVER_DELAY_MS);
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    delaySetOpen(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    delaySetOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (freezeUntil.current === null || Date.now() >= freezeUntil.current) {
          setOpen(value);
        }
      }}
    >
      <PopoverTrigger
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={cn(
          "group relative flex h-12 w-max items-center gap-1 rounded-none border-r border-foreground/[0.06] bg-transparent px-5 font-mono text-xs uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
          "hover:bg-foreground/[0.03] hover:text-foreground focus:bg-foreground/[0.03] data-[state=open]:bg-foreground/[0.03]",
          isActive
            ? "text-foreground"
            : "text-foreground/65 dark:text-foreground/50 dark:hover:text-foreground",
        )}
      >
        Resources
        <ChevronDown
          className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
        {isActive && (
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground/50" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="w-[560px] max-w-[560px] overflow-hidden p-0"
      >
        {/* Featured row — Blog + Changelog */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <FeaturedCard item={featuredA} />
          <FeaturedCard item={featuredB} />
        </div>

        {/* Secondary row — 4 cells */}
        <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
          {secondary.map((item) => (
            <SecondaryCell key={item.href} item={item} />
          ))}
        </div>

        {/* Socials row */}
        <div className="flex items-center justify-around gap-1 border-t border-border px-2 py-3">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex flex-1 items-center justify-center py-1.5 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FeaturedCard({ item }: { item: ResourceItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex flex-col gap-1 rounded-none p-5 transition-colors hover:bg-foreground/[0.03]"
    >
      <Icon className="size-4 text-foreground/70 transition-colors group-hover:text-foreground" />
      <div className="mt-2 text-sm font-medium text-foreground">
        {item.label}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {item.description}
      </p>
    </Link>
  );
}

function SecondaryCell({ item }: { item: ResourceItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-2 rounded-none px-3 py-3 transition-colors hover:bg-foreground/[0.03]"
    >
      <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="text-xs font-medium text-foreground">{item.label}</span>
    </Link>
  );
}
