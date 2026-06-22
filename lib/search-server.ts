import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { stopwords as mandarinStopwords } from "@orama/stopwords/mandarin";

// Single configured Orama search server, shared by the site-search route
// (`app/api/search/route.ts`) and the AI chat tool (`app/api/chat/route.ts`).
// `searchServer.search(query, { locale })` returns SortedResult[].
export const searchServer = createFromSource(source, {
  localeMap: {
    zh: {
      components: {
        tokenizer: createTokenizer({
          stopWords: mandarinStopwords,
        }),
      },
      search: {
        threshold: 0,
      },
    },
  },
});
