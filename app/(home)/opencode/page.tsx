import { setRequestLocale } from "next-intl/server";
import {
  IntegrationStub,
  integrationMetadata,
} from "@/components/integrations/integration-stub";

const NAME = "OpenCode";
const SLUG = "opencode";
const BLURB =
  "Route the provider-agnostic OpenCode runtime through BitRouter with a single base-URL override and reach any model through one API, with automatic failover, cost tracking, and guardrails.";

export const metadata = integrationMetadata(NAME, SLUG, BLURB);

export default function Page() {
  setRequestLocale("en");
  return <IntegrationStub name={NAME} blurb={BLURB} />;
}
