import {
  IntegrationStub,
  integrationMetadata,
} from "@/components/integrations/integration-stub";

const NAME = "Hermes Agent";
const SLUG = "hermes-agent";
const BLURB =
  "Route Hermes Agent through BitRouter with a two-variable override and reach any model through one API, with automatic failover, cost tracking, and guardrails.";

export const metadata = integrationMetadata(NAME, SLUG, BLURB);

export default function Page() {
  return <IntegrationStub name={NAME} blurb={BLURB} />;
}
