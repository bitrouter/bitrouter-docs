// Next may overwrite Vary on prerendered HTML. Do not share-cache either
// representation of a URL that supports content negotiation.
export const negotiatedHeaders = { Vary: "Accept", "Cache-Control": "private, no-store" };

export const markdownHeaders = {
  ...negotiatedHeaders,
  "Content-Type": "text/markdown; charset=utf-8",
};
