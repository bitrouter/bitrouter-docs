import Link from "next/link";
import { enterpriseContactConfig } from "@/lib/enterprise-contact";
import { EnterpriseContactForm } from "./enterprise-contact-form";
import { EnterpriseFaq } from "./enterprise-faq";
import "./zed.css";
import "./enterprise.css";

const faqs = [
  {
    question: "How is Enterprise priced?",
    answer: <>Enterprise services and terms are custom. The OSS router remains free to self-host. Cloud Auto Routing and Elastic Inference share early access pricing of $0.01 per million processed input + output tokens, counted once per request. 0% markup on inference. See <Link href="/pricing">pricing</Link> for the standard service terms.</>,
  },
  {
    question: "Do we need to change our agents?",
    answer: <>Keep the agents you already use. Connect supported harnesses through BitRouter&apos;s API or CLI, then configure the models and routes they can use. See the <Link href="/docs/integration/coding-agents">integration guide</Link> for supported paths.</>,
  },
  {
    question: "Can BitRouter run inside our infrastructure?",
    id: "enterprise-self-hosting",
    answer: <>Yes. The Apache-2.0 router can run in infrastructure you control, with your own credentials, endpoints, and routing policy. A Cloud account is not required. Start with the <Link href="/docs/self-hosting">self-hosting guide</Link>.</>,
  },
  {
    question: "Can we use existing keys, subscriptions, and private endpoints?",
    answer: <>You can configure your own provider keys, supported subscription-backed providers, local models, and private endpoints. Authentication and compatibility depend on the provider or harness; provider charges and subscription limits still apply.</>,
  },
  {
    question: "How do we evaluate whether a routing policy works?",
    answer: <>Define the outcome your workload needs, evaluate candidate policies against it, and inspect request receipts for the route, usage, cost, and latency. Collected evidence and published policy changes are separate steps. The <Link href="/docs/models-routing/evaluations">evaluation guide</Link> explains the workflow.</>,
  },
  {
    question: "What request data does BitRouter record?",
    answer: <>Request receipts record routing and usage metadata. Prompt and response bodies are excluded from telemetry by default; self-hosted deployments can configure capture and exporters. Cloud receipts do not store prompt or response bodies. Review the <Link href="/docs/config/telemetry">telemetry guide</Link> for your deployment.</>,
  },
  {
    question: "What enterprise support is available today?",
    answer: <>The open-source router and BitRouter Cloud are available today. Additional deployment, support, and procurement requirements are discussed with your team as a design partnership. SSO, delegated RBAC, compliance certifications, and contractual SLAs are not a generally available enterprise suite today.</>,
  },
] as const;

export function ZedEnterprisePage() {
  return <main className="zed-bg enterprise-main" id="main">
    <div className="zed-wrap enterprise-page">
      <div className="enterprise-main-layout">
        <article className="enterprise-article" aria-labelledby="enterprise-title">
          <p className="enterprise-eyebrow">Enterprise</p>
          <h1 id="enterprise-title">Make inference<br /><em>follow the work.</em></h1>
          <p className="enterprise-summary">BitRouter brings inference scheduling to your agent workloads. Route routine requests to economy models and reserve stronger inference for demanding work, using policies and endpoints your team controls. Evaluate cost, latency, and results before rolling out changes, while keeping your existing agents and infrastructure.</p>
        </article>
        <aside className="enterprise-contact" aria-labelledby="enterprise-form-title">
          <EnterpriseContactForm available={Boolean(enterpriseContactConfig())} />
        </aside>
      </div>
      <EnterpriseFaq items={faqs} />
    </div>
  </main>;
}
