// Embed generated reference material in an authored guide without changing
// its headings or rewriting headings inside fenced examples.
export function appendReference(guide, reference, { heading, banner }) {
  const frontmatter = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(guide);
  if (!frontmatter || !/^title:\s*\S/m.test(frontmatter[0])) {
    throw new Error('Reference guide needs frontmatter with a title');
  }
  const body = guide.slice(frontmatter[0].length).trim();
  if (body.split('\n').includes(`## ${heading}`)) {
    throw new Error(`Authored guide must not contain the generated ${heading} section`);
  }
  let fence;
  const nested = reference.trim().split('\n').map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      return line;
    }
    return fence ? line : line.replace(/^(#{1,6}) /, (_, hashes) => `${'#'.repeat(Math.min(hashes.length + 1, 6))} `);
  }).join('\n');
  return `${frontmatter[0].trimEnd()}\n\n{/* ${banner} */}\n\n${body}\n\n## ${heading}\n\n${nested}\n`;
}
