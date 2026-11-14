import { readFileSync } from "node:fs";
import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";
import { getSiteOrigin } from "./site-origin";

// Curated task links are content data, shared with the runtime publisher.
export const LLMS_TXT = readFileSync("content-index.md", "utf8")
  .replaceAll("{{SITE_ORIGIN}}", getSiteOrigin())
  .replaceAll("{{PRODUCT_SUMMARY}}", LLMS_PRODUCT_SUMMARY);
