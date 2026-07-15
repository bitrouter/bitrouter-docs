import { setRequestLocale } from "next-intl/server";
import {
  IntegrationStub,
  integrationMetadata,
} from "@/components/integrations/integration-stub";

const NAME = "Claude Code";
const SLUG = "claude-code";
const BLURB =
  "Point Claude Code at BitRouter with a single base-URL override and route any model — Anthropic, OpenAI, or open-weight — through one API, with automatic failover, cost tracking, and guardrails.";

export const metadata = integrationMetadata(NAME, SLUG, BLURB);

export default function Page() {
  setRequestLocale("en");
  return <IntegrationStub name={NAME} blurb={BLURB} />;
}
