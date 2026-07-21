// Configuration + mapping tables for the blog → X Article auto-draft pipeline.
// See docs/blog-to-x-article-automation-plan.md.

/**
 * Maps a blog frontmatter `author` value to the X account it should draft on.
 * `secretPrefix` names the four OAuth 1.0a GitHub secrets seeded into ~/.xurl:
 *   <PREFIX>_CONSUMER_KEY / _CONSUMER_SECRET / _ACCESS_TOKEN / _TOKEN_SECRET
 * `xUsername` is used only in the review comment. Fill in the real handles.
 */
export const AUTHORS = {
  kelsen: { xUsername: "TODO_kelsen_handle", secretPrefix: "X_KELSEN" },
  archer: { xUsername: "TODO_archer_handle", secretPrefix: "X_ARCHER" },
};

export const SITE_BASE_URL = "https://bitrouter.ai";
export const BLOG_BASE_URL = `${SITE_BASE_URL}/blog`;

// When true, the orchestrator appends a deterministic canonical link-back line
// to the reformatted Markdown before encoding (a normal link entity in X).
export const APPEND_LINK_BACK = true;

// DraftJS block type (as emitted by markdown-draft-js) → X Articles block type.
// X supports only: unstyled, header-one|two|three, unordered/ordered-list-item,
// blockquote, atomic. Headers 4-6 clamp to header-three; code-block should never
// reach here (stage ① flattens fenced code to plain text) but is mapped defensively.
export const BLOCK_TYPE_MAP = {
  unstyled: "unstyled",
  blockquote: "blockquote",
  "header-one": "header-one",
  "header-two": "header-two",
  "header-three": "header-three",
  "header-four": "header-three",
  "header-five": "header-three",
  "header-six": "header-three",
  "unordered-list-item": "unordered-list-item",
  "ordered-list-item": "ordered-list-item",
  "code-block": "unstyled",
};

// markdown-draft-js emits UPPERCASE inline styles; X's docs phrase them lowercase.
// If the API rejects lowercase during the first dry-run, switch these to the
// uppercase forms (BOLD/ITALIC/STRIKETHROUGH).
export const STYLE_MAP = {
  BOLD: "bold",
  ITALIC: "italic",
  STRIKETHROUGH: "strikethrough",
};

// markdown-draft-js emits entity type "LINK"; X's docs use "link". Same casing
// caveat as STYLE_MAP.
export const ENTITY_TYPE_MAP = {
  LINK: "link",
};
