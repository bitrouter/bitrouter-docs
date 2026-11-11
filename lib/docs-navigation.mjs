/** Supporting pages keep their section context without becoming sidebar links. */
export const HIDDEN_SIDEBAR_SECTIONS = {
  "/docs/routing/context-routing": "Guides",
  "/docs/reference/decisions": "API",
  "/docs/usage/cloud": "CLI",
  "/docs/self-hosting": "Guides",
  "/docs/cli/agent": "CLI",
  "/docs/cli/request-receipts": "CLI",
  "/docs/integration/claude-code": "Integrations",
  "/docs/integration/codex": "Integrations",
  "/docs/integration/bro-harness": "Integrations",
  "/docs/integration/coding-agents": "Integrations",
};

/**
 * Include supporting pages in native root resolution, while the Item slot omits
 * their links. This projection never filters the canonical discovery source.
 * @param {import('fumadocs-core/page-tree').Root} tree
 * @param {{ url: string, data: { title: string } }[]} pages
 * @returns {import('fumadocs-core/page-tree').Root}
 */
export function createDocsLayoutTree(tree, pages) {
  return {
    ...tree,
    children: tree.children.map((node) => {
      if (node.type !== "folder" || !node.root) return node;
      const supporting = pages
        .filter((page) => HIDDEN_SIDEBAR_SECTIONS[page.url] === node.name)
        .map((page) => ({
          type: /** @type {const} */ ("page"),
          name: page.data.title,
          url: page.url,
          $id: `supporting:${page.url}`,
        }));
      return { ...node, children: [...node.children, ...supporting] };
    }),
  };
}
