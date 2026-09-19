import { ZED_LINKS } from "./primitives";

function CoreVisual() {
  return (
    <div className="zed-feature-visual zed-core-visual" aria-hidden="true">
      <div className="zed-visual-caption">local deployment</div>
      <div className="zed-core-stage">
        <div className="zed-core-binary">
          <span className="zed-status-dot" />
          <div>
            <strong>bitrouter</strong>
            <span>one process</span>
          </div>
        </div>
        <div className="zed-core-line" />
        <div className="zed-core-modules">
          {[
            ["providers", "OpenAI · Anthropic · custom"],
            ["protocols", "OpenAI · Anthropic · MCP · ACP"],
            ["capabilities", "tools · telemetry · guardrails"],
          ].map(([label, value]) => (
            <div className="zed-core-module" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="zed-visual-footer">SQLite optional · no queue · no sidecar</div>
    </div>
  );
}

function DecisionVisual() {
  return (
    <div className="zed-feature-visual zed-decision-visual" aria-hidden="true">
      <div className="zed-visual-caption">route receipt</div>
      <div className="zed-decision-flow">
        {[
          ["request", "bitrouter/auto"],
          ["workflow state", "midstream"],
          ["matched rule", "tier: cheap"],
          ["selected route", "kimi-k3 · max"],
        ].map(([label, value]) => (
          <div className="zed-decision-step" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="zed-decision-receipt">
        <span>decision</span>
        <strong>policy route 03 matched</strong>
        <span>inspectable · versioned · reversible</span>
      </div>
    </div>
  );
}

function WorkflowVisual() {
  return (
    <div className="zed-feature-visual zed-workflow-visual" aria-hidden="true">
      <div className="zed-visual-caption">workflow policy</div>
      <div className="zed-workflow-routes">
        {[
          ["plan", "strong"],
          ["edit", "economy"],
          ["verify", "strong"],
          ["recover", "guarded fallback"],
        ].map(([step, route]) => (
          <div className="zed-workflow-route" key={step}>
            <span>{step}</span>
            <i />
            <strong>{route}</strong>
          </div>
        ))}
      </div>
      <div className="zed-workflow-diff">
        <span className="del">- midstream: capable</span>
        <span className="add">+ midstream: cheap</span>
        <small>policy.lock · review before publish</small>
      </div>
    </div>
  );
}

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
