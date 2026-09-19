import { ZED_LINKS } from "./primitives";
import { CoreVisual, DecisionVisual, WorkflowVisual } from "./feature-visuals";

const FEATURES = [
  {
    n: "01",
    kicker: "Core",
    title: (
      <>
        Minimal core. <span>Lightweight &amp; extensible.</span>
      </>
    ),
    body: "Start locally with one binary: no external database, queue, container runtime, or sidecar. Add providers, protocol adapters, tools, and telemetry as your deployment needs them.",
    link: ZED_LINKS.github,
    linkLabel: "View source",
    visual: <CoreVisual />,
  },
  {
    n: "02",
    kicker: "Control",
    title: (
      <>
        Interpretable decisions. <span>Under your control.</span>
      </>
    ),
    body: "Follow a decision from workflow state to the matched rule and selected route. Keep policy in readable configuration, inspect resolution with bro route, and version it in Git.",
    link: "/docs/configuration/routing",
    linkLabel: "Inspect routing",
    visual: <DecisionVisual />,
  },
  {
    n: "03",
    kicker: "Workflow",
    title: (
      <>
        A customizable router. <span>Adapt it to your workflow.</span>
      </>
    ),
    body: "Add models, providers, tools, and workflow-specific routing behind one stable request interface. Tune planning, routine work, verification, and recovery independently.",
    link: "/docs/customization",
    linkLabel: "Customize BitRouter",
    visual: <WorkflowVisual />,
  },
] as const;

export function Features() {
  return (
    <section className="zed-wrap zed-sec" id="features" aria-label="BitRouter features">
      <div className="zed-feature-section-label">Built to be yours</div>
      <div className="zed-features">
        {FEATURES.map((feature, index) => (
          <article className={index % 2 === 1 ? "zed-feature-row reverse" : "zed-feature-row"} key={feature.n}>
            <div className="zed-feature-copy">
              <div className="zed-feature-kicker">
                <span>{feature.n}</span> / {feature.kicker}
              </div>
              <h2 className="zed-display">{feature.title}</h2>
              <p>{feature.body}</p>
              <a className="zed-btn-underline" href={feature.link}>
                {feature.linkLabel}
              </a>
            </div>
            <div className="zed-feature-media">{feature.visual}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
