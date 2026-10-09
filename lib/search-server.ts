import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { isCanonicalDoc } from "@/lib/docs-visibility";

// Single configured Orama search server, shared by the site-search route
// (`app/api/search/route.ts`) and the AI chat tool (`app/api/chat/route.ts`).
// `searchServer.search(query)` returns SortedResult[].
export const searchServer = createFromSource({
  ...source,
  getPages: (...args: Parameters<typeof source.getPages>) =>
    source.getPages(...args).filter(isCanonicalDoc),
});
