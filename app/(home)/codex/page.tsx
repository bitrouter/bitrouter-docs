import {
  IntegrationStub,
  integrationMetadata,
} from "@/components/integrations/integration-stub";

const NAME = "Codex";
const SLUG = "codex";
const BLURB =
  "Point OpenAI Codex at BitRouter with a single base-URL override and route any model through one API, with automatic failover, cost tracking, and guardrails.";

export const metadata = integrationMetadata(NAME, SLUG, BLURB);

export default function Page() {
  return <IntegrationStub name={NAME} blurb={BLURB} />;
}
