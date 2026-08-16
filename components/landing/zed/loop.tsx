import { STEPS, type Artifact, type Step } from "./data";
import { highlightYamlLine, TrafficLights } from "./primitives";

/**
 * Act → Observe → Evaluate → Improve.
 *
 * Merged from the two sections this replaces ("One policy" + "Act. Observe.
 * Evaluate. Learn."), which described the same object twice.
 *
 * Alternating rows: the artifact takes the left column on odd steps and the
 * right on even ones, so the page zig-zags down the four steps. What changed
 * from the section this grew out of is the content, not the rhythm — the file
 * is sliced *into* the steps (each shows only the lines it touches, step 04
 * shows those same lines changing), and the containment details sit in the step
 * that raises the worry rather than in a checklist underneath.
 *
 * On the stacked breakpoint the artifact always follows its copy: the words
 * should arrive before the config on a phone, whichever side the row uses on
 * desktop.
 */

/** Router output: the summary line leads, the indented hops recede. */
function TraceLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{ whiteSpace: "pre", color: l.startsWith(" ") ? "var(--z-ink-5)" : "var(--z-ink-2)" }}
        >
          {l}
        </div>
      ))}
    </>
  );
}

/** A unified diff: `+` added, `-` removed, everything else context. */
function DiffLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => {
        const added = l.startsWith("+");
        const removed = l.startsWith("-");
        const cost = !added && !removed && l.includes("→");
        return (
          <div
            key={i}
            className={added ? "zed-diff add" : removed ? "zed-diff del" : "zed-diff"}
            style={{ color: cost ? "var(--z-green)" : undefined }}
          >
            {l || " "}
          </div>
        );
      })}
    </>
  );
}

function ArtifactPane({ a }: { a: Artifact }) {
  return (
    <div className={`zed-artifact ${a.kind}`}>
      <div className="zed-artifact-head">
        <TrafficLights />
        <span style={{ marginLeft: 4 }}>{a.caption}</span>
      </div>
      <div className="zed-artifact-body">
        {a.kind === "yaml" && a.lines.map((l, i) => highlightYamlLine(l, i))}
        {a.kind === "trace" && <TraceLines lines={a.lines} />}
        {a.kind === "diff" && <DiffLines lines={a.lines} />}
      </div>
    </div>
  );
}

function StepRow({ s, reverse }: { s: Step; reverse: boolean }) {
  return (
    <div className={reverse ? "zed-step reverse" : "zed-step"}>
      <div className="zed-step-visual">
        <ArtifactPane a={s.artifact} />
        {s.readout && (
          <div className="zed-readout">
            {s.readout.map((l, i) => (
              <div key={i} style={{ whiteSpace: "pre" }}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="zed-step-main">
        <div className="zed-step-kicker">
          <span className="zed-step-n">{s.n}</span> {s.kicker}
        </div>
        <h3 className="zed-step-title">{s.title}</h3>
        <p className="zed-step-body">{s.body}</p>
        {s.asides && (
          <div className="zed-asides">
            {s.asides.map((a) => (
              <div key={a.name} className="zed-aside">
                <span className="zed-aside-name">{a.name}</span>
                <span className="zed-aside-knob">{a.knob}</span>
                <div className="zed-aside-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Loop() {
  return (
    <section className="zed-section" id="loop">
      <div className="zed-wrap" style={{ padding: "88px 34px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 className="zed-display" style={{ fontSize: 46, lineHeight: 1.06, margin: 0 }}>
            Act. Observe. Evaluate. <span style={{ color: "var(--z-blue)" }}>Improve.</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--z-ink-4)",
              margin: "18px 0 0",
              maxWidth: "66ch",
            }}
          >
            Other routers are tuned once, offline, on somebody else&apos;s benchmark. BitRouter closes
            the loop against your own traffic — and every lap lands as a diff to one file you own.
          </p>
        </div>

        <div className="zed-loop">
          {STEPS.map((s, i) => (
            <StepRow key={s.n} s={s} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
