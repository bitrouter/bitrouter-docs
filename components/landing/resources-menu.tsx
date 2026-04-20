"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  GitBranch,
  Palette,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
  { label: "Changelog", description: "Latest releases and improvements", href: "/changelog", icon: GitBranch },
  { label: "Community", description: "Discord, Reddit, GitHub", href: "/community", icon: Users },
  { label: "Careers", description: "Small by choice", href: "/careers", icon: Briefcase },
  { label: "Brand", description: "Logos and guidelines", href: "/brand", icon: Palette },
  { label: "Legal", description: "Privacy & terms", href: "/legal", icon: Scale },
];

const RESOURCE_PREFIXES = RESOURCE_ITEMS.map((i) => i.href);

export function ResourcesTabCell() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = RESOURCE_PREFIXES.some((p) => normalizedPath.startsWith(p));

  const [featuredA, featuredB, ...secondary] = RESOURCE_ITEMS;

  return (
    <NavigationMenu
      viewport={false}
      className="flex max-w-none flex-none items-stretch justify-start"
    >
      <NavigationMenuList className="h-12 justify-start gap-0">
        <NavigationMenuItem className="flex items-stretch">
          <NavigationMenuTrigger
            className={cn(
              "relative flex h-12 w-max items-center gap-1 rounded-none border-r border-foreground/[0.06] bg-transparent px-5 font-mono text-xs uppercase tracking-wider transition-colors",
              "hover:bg-foreground/[0.03] hover:text-foreground focus:bg-foreground/[0.03] data-[state=open]:bg-foreground/[0.03]",
              isActive
                ? "text-foreground"
                : "text-foreground/65 dark:text-foreground/50 dark:hover:text-foreground",
            )}
          >
            Resources
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground/50" />
            )}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="right-0 left-auto !w-[560px] !max-w-[560px] p-0">
            <div className="overflow-hidden">
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
                  <NavigationMenuLink
                    key={label}
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex items-center justify-center py-1.5 text-muted-foreground/70 transition-colors hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function FeaturedCard({ item }: { item: ResourceItem }) {
  const Icon = item.icon;
  return (
    <NavigationMenuLink asChild>
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
    </NavigationMenuLink>
  );
}

function SecondaryCell({ item }: { item: ResourceItem }) {
  const Icon = item.icon;
  return (
    <NavigationMenuLink asChild>
      <Link
        href={item.href}
        className="group flex items-center gap-2 rounded-none px-3 py-3 transition-colors hover:bg-foreground/[0.03]"
      >
        <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="text-xs font-medium text-foreground">{item.label}</span>
      </Link>
    </NavigationMenuLink>
  );
}
