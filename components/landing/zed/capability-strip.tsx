const CAPABILITIES = ["any agent", "any model", "any compute", "any data"] as const;

const GRID =
  "mt-[var(--z-sec)] grid grid-cols-2 border-y border-[var(--z-rule)] " +
  "[&>*:nth-child(-n+2)]:border-b [&>*:nth-child(2n)]:border-r-0 " +
  "sm:grid-cols-4 sm:[&>*:nth-child(-n+2)]:border-b-0 " +
  "sm:[&>*:nth-child(2n)]:border-r sm:[&>*:nth-child(4n)]:border-r-0";

const CELL =
  "flex min-h-24 items-center justify-center border-r border-[var(--z-rule)] " +
  "px-3 py-7 text-center font-mono text-[13px] text-[var(--z-ink-3)] lg:text-[14px]";

/** A footer-style interoperability statement between the live demo and features. */
export function CapabilityStrip() {
  return (
    <section className={GRID} aria-label="BitRouter interoperability">
      {CAPABILITIES.map((capability) => (
        <div className={CELL} key={capability}>
          {capability}
        </div>
      ))}
    </section>
  );
}
