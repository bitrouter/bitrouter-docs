"use client";

import * as React from "react";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import { NAV_ITEMS, resolveHref, type HeaderConfig } from "./nav-config";
import { useChangelogUnseen } from "@/components/changelog/use-changelog-unseen";

/**
 * Auth-aware site header for the marketing/docs website.
 *
 * Design language: the v3 dark nav. A bare ≋ mask mark + lowercase mono
 * `bitrouter` wordmark, a centred row of uppercase mono nav links
 * (11.5px / 0.16em, ink-3 → ink on hover), then the utility cluster — the
 * "Ask AI…" search box, GitHub, "book demo" and "Get API key". The shell is
 * sticky + translucent (`rgba(12,13,16,0.85)`) with a `--z-rule` hairline. All
 * colours come from the global Zed tokens (`--z-*`), so it matches every page.
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
  /** Current pathname, for active-link highlighting. */
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
  /**
   * Small uppercase label after the wordmark — the docs shell renders
   * `bitrouter docs`, marketing pages render the wordmark alone.
   */
  wordmarkSuffix?: string;
}

// ── internal helpers ─────────────────────────────────────

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Shared nav-item base: uppercase mono at the v3 label size, muted → ink on
// hover. The tracking is what makes the row read as a rule of labels rather
// than a list of words, so it stays on every nav link.
const NAV_ITEM =
  "whitespace-nowrap font-mono text-[11.5px] uppercase tracking-[0.16em] transition-colors";

// The right-hand utility links share the nav's type, one step brighter so the
// cluster reads as actions rather than navigation.
const UTIL_LINK =
  "shrink-0 whitespace-nowrap font-mono text-[11.5px] uppercase tracking-[0.16em] transition-colors";

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
  const p = pathname || "/";
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
  wordmarkSuffix,
}: SiteHeaderProps): React.ReactElement {
  const isAuthed = Boolean(session);
  const items = NAV_ITEMS;
  const changelogUnseen = useChangelogUnseen();
  useCalFounderCall();
  return (
    <div className="flex h-[62px] w-full items-center gap-6 px-[22px] sm:px-6 lg:px-6 xl:px-10">
      {leadingSlot ? <div className="flex shrink-0 items-center">{leadingSlot}</div> : null}

      {/* Logo — bare ≋ mask mark + lowercase mono wordmark. v3 drops the
          blue-bordered box: the mark carries ink, not accent. */}
      <a
        href={config.webBaseUrl}
        aria-label="BitRouter home"
        className="flex shrink-0 items-center gap-[9px] transition-opacity hover:opacity-80"
      >
        <span
          aria-hidden
          className="block size-5 bg-[var(--z-ink)]"
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
        {/* Wordmark drops below `sm`: the row is logo + search + CTA + menu,
            which overflows a 375px viewport and pushes the CTA over the search
            trigger. The mark alone still identifies and links home. */}
        <span className="hidden font-mono text-[13px] tracking-[0.02em] text-[var(--z-ink)] sm:inline">
          bitrouter
        </span>
        {wordmarkSuffix ? (
          <span className="ml-1 hidden font-mono text-[11.5px] uppercase tracking-[0.16em] text-[var(--z-ink-6)] sm:inline">
            {wordmarkSuffix}
          </span>
        ) : null}
      </a>

      {/* Primary nav — centred in the leftover space. Hidden below `lg`, where
          the mobile menu takes over. */}
      <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-11">
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

      {/* Utility cluster — search, GitHub, demo, auth. `ml-auto` keeps it right
          even when the nav is hidden and the centring flex-1 is gone. */}
      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-[22px]">
        {searchSlot ? <div className="flex min-w-0 items-center">{searchSlot}</div> : null}

        {utilitySlot ? (
          <div className="hidden items-center sm:flex">{utilitySlot}</div>
        ) : null}

        {/* Secondary CTA — book a founder call. Shown for all visitors. */}
        <BookDemoButton
          location="header"
          className={cn(
            UTIL_LINK,
            "hidden cursor-pointer text-[var(--z-ink-3)] hover:text-[var(--z-ink)] lg:inline-flex",
          )}
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
          // Single auth CTA — "Get API key" routes to the console's sign-in
          // (social sign-in auto-creates the account, so it is sign-in/sign-up).
          <a
            href={`${config.consoleBaseUrl}/sign-in`}
            className={cn(UTIL_LINK, "text-[var(--z-ink)] hover:text-[var(--z-ink-3)]")}
          >
            Get API key
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
      style={{ ["--fd-nav-height" as string]: "62px" }}
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
  const items = NAV_ITEMS;
  const changelogUnseen = useChangelogUnseen();

  return (
    <div className="flex items-center lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="flex cursor-pointer items-center p-0.5 text-[var(--z-ink-3)] transition-colors hover:text-[var(--z-ink)]"
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
        <div className="absolute inset-x-0 top-[62px] z-50 border-b border-[var(--z-rule)] bg-[rgba(12,13,16,0.95)] px-[22px] pb-6 pt-2 backdrop-blur-lg">
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => (
              <a
                key={item.key}
                href={resolveHref(item, config)}
                onClick={() => setOpen(false)}
                className="py-[11px] font-mono text-xs uppercase tracking-[0.16em] text-[var(--z-ink-3)] transition-colors hover:text-[var(--z-ink)]"
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
              className="mt-2 flex cursor-pointer items-center justify-center border border-[var(--z-rule)] px-4 py-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-[var(--z-ink)] transition-colors hover:border-[var(--z-rule-2)] hover:bg-white/[0.02]"
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
                    className="flex flex-1 cursor-pointer items-center justify-center border border-[var(--z-rule)] px-4 py-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-[var(--z-ink-3)] transition-colors hover:bg-white/[0.03]"
                  >
                    Sign out
                  </button>
                ) : null
              ) : (
                <a
                  href={`${config.consoleBaseUrl}/sign-in`}
                  className="flex flex-1 items-center justify-center rounded-[2px] bg-[var(--z-cta)] px-4 py-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#1a56f0]"
                >
                  Get API key
                </a>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
