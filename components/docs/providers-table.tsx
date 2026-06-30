import { fetchProviders } from "@/lib/providers-server";
import { ProvidersTableClient, type ProviderRow } from "./providers-table-client";

// Async server component: registered providers, read straight from the public
// provider-registry repo with the same ISR cadence as the /providers route
// (revalidate 10 min). Registry = who is registered; the models table above
// reflects what is actually serveable now, with live pricing.
export async function ProvidersTable() {
  const providers = await fetchProviders();
  const rows: ProviderRow[] = providers
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      models: p.models.length,
      registryUrl: p.registryUrl,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return <ProvidersTableClient rows={rows} />;
}
