export type SocialKey = "github" | "discord" | "huggingface" | "x";
export type SocialLink = { key: SocialKey; label: string; href: string };

/**
 * Every community profile we own. This is the Organization `sameAs` set in the
 * root layout's JSON-LD, so it stays complete even when the footer shows a
 * subset — dropping a profile here removes it from the entity graph, which is
 * not the same decision as dropping it from the footer.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { key: "github", label: "GitHub", href: "https://github.com/bitrouter" },
  { key: "discord", label: "Discord", href: "https://discord.gg/G3zVrZDa5C" },
  { key: "huggingface", label: "Hugging Face", href: "https://huggingface.co/BitRouterAI" },
  { key: "x", label: "Twitter/X", href: "https://x.com/BitRouterAI" },
];

export function socialHref(key: SocialKey): string {
  const found = SOCIAL_LINKS.find((s) => s.key === key);
  if (!found) throw new Error(`unknown social link: ${key}`);
  return found.href;
}
