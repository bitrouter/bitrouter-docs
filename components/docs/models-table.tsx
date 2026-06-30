import { getDocsModels } from "@/lib/models-catalog";
import { ModelsTableClient } from "./models-table-client";

// Async server component: ISR-fresh catalog (revalidate 10 min) handed to the
// client filter UI. Renders inside MDX via the global <ModelsTable /> mapping.
export async function ModelsTable() {
  const rows = await getDocsModels();
  return <ModelsTableClient rows={rows} />;
}
