import { setRequestLocale } from "next-intl/server";
import {
  IntegrationStub,
  integrationMetadata,
} from "@/components/integrations/integration-stub";

const NAME = "OpenClaw";
const SLUG = "openclaw";
const BLURB =
  "Route the OpenClaw agent through BitRouter with a two-variable override and reach any model through one API, with automatic failover, cost tracking, and guardrails.";

export const metadata = integrationMetadata(NAME, SLUG, BLURB);

export default function Page() {
  setRequestLocale("en");
  return <IntegrationStub name={NAME} blurb={BLURB} />;
}
