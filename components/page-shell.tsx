import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PageShellSection = {
  id: string;
  label: string;
  children: ReactNode;
};

export type PageShellCta = {
  label: string;
  href: string;
  external?: boolean;
  variant?: "solid" | "outline";
};

export function PageShell({
  overline,
  title,
  intro,
  sections,
  cta,
  footnote,
}: {
  overline: string;
  title: string;
  intro: ReactNode;
  sections: PageShellSection[];
  cta?: PageShellCta;
  footnote?: ReactNode;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row">
      {/* LEFT rail */}
      <aside className="relative w-full border-b border-border lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:w-[38%] lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col justify-between px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {overline}
            </div>
            <h1 className="mt-6 inline-block border-b border-foreground pb-1 text-5xl font-medium tracking-tight">
              {title}
            </h1>
            <div className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {intro}
            </div>

            {sections.length > 0 && (
              <nav className="mt-10 border-t border-border">
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-between gap-3 border-b border-border py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span>{section.label}</span>
                    <span className="tabular-nums text-muted-foreground/60 group-hover:text-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                ))}
              </nav>
            )}
          </div>

          {cta && (
            <div className="mt-10">
              <CtaButton {...cta} />
            </div>
          )}
          {footnote && !cta && (
            <div className="mt-10 font-mono text-[11px] text-muted-foreground/60">
              {footnote}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT content */}
      <div className="flex-1">
        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className={cn(
                "scroll-mt-16",
                i > 0 && "mt-24",
              )}
            >
              <header className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                  {section.label}
                </h2>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </header>
              <div className="mt-8 space-y-14">{section.children}</div>
            </section>
          ))}
          {footnote && cta && (
            <div className="mt-24 border-t border-border pt-6 font-mono text-[11px] text-muted-foreground/60">
              {footnote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CtaButton({ label, href, external, variant = "solid" }: PageShellCta) {
  const className = cn(
    "group inline-flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors",
    variant === "solid"
      ? "bg-foreground text-background hover:opacity-90"
      : "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ArrowUpRight className="size-3.5" />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
      <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

// ── Content primitives for the right column ──────────────

export function Subsection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xl font-medium tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function SmallLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}
