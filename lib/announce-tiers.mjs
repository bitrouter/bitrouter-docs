/**
 * Which channels a release gets announced on, keyed by its significance.
 *
 * This used to be a version regex inside the announce script, which meant the
 * page and the announcer each decided independently how much a release was
 * worth — and a human who judged an otherwise-routine release important had no
 * way to say so. Both now read the same `significance`, so promoting an entry
 * in its frontmatter promotes it everywhere at once.
 *
 * The escalation is deliberate: Discord is where people opt into release noise,
 * X is a public statement, and email is the most intrusive of the three, so
 * only a major line opening earns it.
 */
export const CHANNELS_BY_SIGNIFICANCE = {
  routine: ["discord"],
  notable: ["discord", "x"],
  highlight: ["discord", "x", "email"],
};

/**
 * @param {string} significance
 * @returns {string[]} channels, quietest tier as the fallback
 */
export function channelsFor(significance) {
  return CHANNELS_BY_SIGNIFICANCE[significance] ?? CHANNELS_BY_SIGNIFICANCE.routine;
}
