"use client";

import * as React from "react";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import { navItemsFor, resolveHref, type HeaderConfig } from "./nav-config";
import { useChangelogUnseen } from "@/components/changelog/use-changelog-unseen";

/**
 * Auth-aware site header for the marketing/docs website.
 *
 * Design language: the "Zed dark" nav. A blue-bordered ≋ mark + IBM Plex Sans
 * `bitrouter.` wordmark, IBM Plex Sans nav links (muted → ink on hover), and two
 * IBM Plex Mono CTAs — a bordered "book demo" and the blue "get api key →". The
 * shell is sticky + translucent (`rgba(12,13,16,0.85)`) with a `--z-rule` hairline.
 * All colours come from the global Zed tokens (`--z-*`), so it matches every page.
 *
 * Takes `session`, `pathname`, and `onSignOut` as props supplied by the web
 * app, plus slots for app-specific content. Imports nothing app-local.
 */

// ── public types ─────────────────────────────────────────

/** Minimal session shape the header needs (subset of Better Auth). */
export interface HeaderSession {
  user: { email: string; name?: string | null; image?: string | null };
}

export interface SiteHeaderProps {
  config: HeaderConfig;
  /** Null/undefined => logged out. Passed in by each app. */
  session: HeaderSession | null | undefined;
  /** Current pathname (locale-stripped), for active-link highlighting. */
  pathname?: string;
  onSignOut?: () => void;
  /** Show "Sign out" in the account dropdown / mobile menu. */
  showSignOut?: boolean;
  /** Optional leading cell (generally empty on the web header). */
  leadingSlot?: React.ReactNode;
  /** web: ⌘K command palette. */
  searchSlot?: React.ReactNode;
  /** web: GitHub stars. */
  utilitySlot?: React.ReactNode;
}

// ── internal helpers ─────────────────────────────────────

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Shared nav-item base: IBM Plex Sans, muted → ink on hover (Zed nav).
const NAV_ITEM = "px-3 py-2 font-sans text-sm transition-colors";

/**
 * "book demo" — the secondary header CTA that opens the founder-call Cal.com
 * embed (the same `founder-call` event the enterprise page books). Always
 * shown, for prospects and customers alike. Cal's `getCalApi("ui")` must be
 * initialised once on the page (see `useCalFounderCall`) for the data-cal
 * attributes to take over the click.
 */
function BookDemoButton({
  className,
  location,
}: {
  className: string;
  location: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      data-cal-namespace="founder-call"
      data-cal-link="kelsenliu/founder-call"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      onClick={() => posthog.capture("founder_call_booked", { location })}
      className={className}
    >
      book demo
    </button>
  );
}

/** Initialise the Cal.com founder-call embed once for the header CTA. */
function useCalFounderCall(): void {
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: "founder-call" });
      if (!cancelled) cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}

function initials(session: HeaderSession): string {
  const base = session.user.name?.trim() || session.user.email;
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? base[0] ?? "?";
  const b = parts.length > 1 ? parts[1][0] : (base[1] ?? "");
  return (a + b).toUpperCase();
}

function isActive(pathname: string | undefined, localPath: string | undefined): boolean {
  if (!pathname || !localPath) return false;
  const p = pathname.replace(/^\/(en|zh)(?=\/|$)/, "") || "/";
  return localPath === "/" ? p === "/" : p.startsWith(localPath);
}

// ── component ────────────────────────────────────────────

/**
 * Headerless variant — the flex row only, no `<header>` element, no sticky
 * positioning, no border/background. Drops into a host header that owns
 * positioning (e.g. the fumadocs notebook docs grid header).
 */
export function SiteHeaderBody({
  config,
  session,
  pathname,
  onSignOut,
  showSignOut = true,
  leadingSlot,
  searchSlot,
  utilitySlot,
}: SiteHeaderProps): React.ReactElement {
  const isAuthed = Boolean(session);
  const items = navItemsFor(isAuthed);
  const changelogUnseen = useChangelogUnseen();
  useCalFounderCall();
  return (
    <div className="flex h-12 w-full items-center gap-1 px-4 sm:px-6 lg:px-[34px]">
      {leadingSlot ? <div className="flex items-center pr-1">{leadingSlot}</div> : null}

      {/* Logo — official routing mark in a blue-bordered box + IBM Plex Sans wordmark */}
      <a
        href={config.webBaseUrl}
        aria-label="BitRouter home"
        className="flex shrink-0 items-center gap-2.5 py-1.5 pr-2.5 transition-opacity hover:opacity-90"
      >
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-md border border-[var(--z-blue)] text-[var(--z-blue)]">
          <span
            aria-hidden
            className="block size-4 bg-current"
            style={{
              WebkitMaskImage: "url(/bitrouter-mark.png)",
              maskImage: "url(/bitrouter-mark.png)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </span>
        <span className="font-sans text-[17px] font-semibold tracking-[-0.01em] text-[var(--z-ink)]">
          bitrouter.
        </span>
      </a>

      {/* Primary nav — hidden on small screens (mobile menu below) */}
      <nav className="ml-1 hidden items-center gap-0.5 lg:flex">
        {items.map((item) => {
          const href = resolveHref(item, config);
          const active = isActive(pathname, item.webPath);
          return (
            <a
              key={item.key}
              href={href}
              className={cn(
                NAV_ITEM,
                active
                  ? "text-[var(--z-ink)]"
                  : "text-[var(--z-ink-3)] hover:text-[var(--z-ink)]",
              )}
            >
              {item.label}
              {item.key === "changelog" && changelogUnseen && (
                <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[var(--z-blue)] align-middle" aria-label="New" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Flexible spacer — also holds the ⌘K search slot when present */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2">{searchSlot}</div>

      {/* Utility slot (GitHub stars on web) */}
      {utilitySlot ? (
        <div className="hidden items-center gap-2 px-1 sm:flex">{utilitySlot}</div>
      ) : null}

      {/* Secondary CTA — book a founder call. Shown for all visitors. */}
      <BookDemoButton
        location="header"
        className="hidden shrink-0 whitespace-nowrap rounded-[7px] border border-[var(--z-rule-2)] px-3.5 py-2 font-mono text-[13px] lowercase text-[var(--z-ink)] transition-colors hover:border-[var(--z-ink-6)] hover:bg-white/[0.03] sm:inline-flex"
      />

      {/* Auth zone */}
      {isAuthed && session ? (
        <AccountMenu
          config={config}
          session={session}
          onSignOut={onSignOut}
          showSignOut={showSignOut}
        />
      ) : (
        // Single auth CTA — "get api key" routes to the console's sign-in
        // (social sign-in auto-creates the account, so it is sign-in/sign-up).
        <a
          href={`${config.consoleBaseUrl}/sign-in`}
          className="ml-1 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[7px] bg-[var(--z-cta)] px-3.5 py-2 font-mono text-[13px] font-medium lowercase text-white transition-colors hover:bg-[#1a56f0]"
        >
          get api key
          <span aria-hidden>→</span>
        </a>
      )}

      {/* Mobile nav trigger */}
      <MobileMenu
        config={config}
        session={session}
        pathname={pathname}
        onSignOut={onSignOut}
        showSignOut={showSignOut}
        utilitySlot={utilitySlot}
      />
    </div>
  );
}

/**
 * Full header: the body wrapped in a sticky, translucent, blurred `<header>`
 * shell. Used as the fumadocs `nav.component` and anywhere the header owns its
 * own positioning.
 */
export function SiteHeader(props: SiteHeaderProps): React.ReactElement {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[var(--z-rule)] bg-[rgba(12,13,16,0.85)] backdrop-blur-lg"
      style={{ ["--fd-nav-height" as string]: "48px" }}
    >
      <SiteHeaderBody {...props} />
    </header>
  );
}

// ── account dropdown (logged in) ─────────────────────────

function AccountMenu({
  config,
  session,
  onSignOut,
  showSignOut,
}: {
  config: HeaderConfig;
  session: HeaderSession;
  onSignOut?: () => void;
  showSignOut: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const item =
    "block rounded-[7px] px-3 py-2 font-mono text-xs lowercase tracking-tight text-[var(--z-ink-3)] transition-colors hover:bg-white/[0.05] hover:text-[var(--z-ink)]";

  return (
    <div ref={ref} className="relative ml-1 flex shrink-0 items-center">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title={session.user.email}
        className="flex items-center gap-2 rounded-[10px] px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-[var(--z-rule-2)] bg-white/[0.06] font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--z-ink-2)]">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="size-7 rounded-full object-cover" />
          ) : (
            initials(session)
          )}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden
          className={cn(
            "hidden text-[var(--z-ink-6)] transition-transform sm:block",
            open && "rotate-180",
          )}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-60 origin-top-right rounded-[12px] border border-[var(--z-rule-2)] bg-[var(--z-bg)] p-1.5 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.7)]"
        >
          <div className="border-b border-[var(--z-rule)] px-3 py-2.5">
            <div className="truncate font-mono text-xs text-[var(--z-ink)]">
              {session.user.name || "Account"}
            </div>
            <div className="truncate font-mono text-[11px] text-[var(--z-ink-5)]">
              {session.user.email}
            </div>
          </div>
          <div className="py-1">
            <a role="menuitem" href={`${config.consoleBaseUrl}/dashboard`} className={item}>
              Dashboard
            </a>
            <a
              role="menuitem"
              href={`${config.consoleBaseUrl}/dashboard/api-keys`}
              className={item}
            >
              API Keys
            </a>
            <a role="menuitem" href={`${config.consoleBaseUrl}/dashboard/billing`} className={item}>
              Billing
            </a>
            <a role="menuitem" href={`${config.consoleBaseUrl}/settings/general`} className={item}>
              Settings
            </a>
          </div>
          {showSignOut && onSignOut ? (
            <div className="border-t border-[var(--z-rule)] pt-1">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className={cn(item, "w-full text-left")}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── mobile menu ──────────────────────────────────────────

function MobileMenu({
  config,
  session,
  onSignOut,
  showSignOut,
  utilitySlot,
}: {
  config: HeaderConfig;
  session: HeaderSession | null | undefined;
  pathname?: string;
  onSignOut?: () => void;
  showSignOut: boolean;
  utilitySlot?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isAuthed = Boolean(session);
  const items = navItemsFor(isAuthed);
  const changelogUnseen = useChangelogUnseen();

  return (
    <div className="flex items-center lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="ml-1 flex items-center rounded-[9px] px-3 py-2 text-[var(--z-ink-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--z-ink)]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          {open ? (
            <path
              d="M4 4l10 10M14 4L4 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M2 5h14M2 9h14M2 13h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-12 z-50 border-b border-[var(--z-rule)] bg-[rgba(12,13,16,0.95)] p-3 backdrop-blur-lg">
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => (
              <a
                key={item.key}
                href={resolveHref(item, config)}
                onClick={() => setOpen(false)}
                className="rounded-[9px] px-3 py-2.5 font-sans text-sm text-[var(--z-ink-3)] transition-colors hover:bg-white/[0.04] hover:text-[var(--z-ink)]"
              >
                {item.label}
                {item.key === "changelog" && changelogUnseen && (
                  <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[var(--z-blue)] align-middle" aria-label="New" />
                )}
              </a>
            ))}
            {utilitySlot ? (
              <div className="mt-1 flex items-center border-t border-[var(--z-rule)] px-1 pt-2.5">
                {utilitySlot}
              </div>
            ) : null}
            <BookDemoButton
              location="header_mobile"
              className="mt-2 flex items-center justify-center rounded-[7px] border border-[var(--z-rule-2)] px-4 py-2.5 font-mono text-[13px] lowercase text-[var(--z-ink)] transition-colors hover:bg-white/[0.04]"
            />
            <div className="mt-2 flex items-center gap-2">
              {isAuthed && session ? (
                showSignOut && onSignOut ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onSignOut();
                    }}
                    className="flex flex-1 items-center justify-center rounded-[10px] border border-[var(--z-rule-2)] px-4 py-2.5 font-mono text-[13px] lowercase tracking-tight text-[var(--z-ink-3)] transition-colors hover:bg-white/[0.05]"
                  >
                    Sign out
                  </button>
                ) : null
              ) : (
                <a
                  href={`${config.consoleBaseUrl}/sign-in`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[7px] bg-[var(--z-cta)] px-4 py-2.5 font-mono text-[13px] lowercase text-white transition-colors hover:bg-[#1a56f0]"
                >
                  get api key
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
