// Capture a committed upstream schema; builds never need an upstream checkout.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
if (args.length !== 4 || args[0] !== '--repo' || args[2] !== '--ref') {
  throw new Error('Usage: pnpm snapshot:config --repo /path/to/bitrouter --ref <commit-or-tag>');
}
const git = (...argv) => execFileSync('git', ['-C', resolve(args[1]), ...argv], { encoding: 'utf8' }).trimEnd();
const revision = git('rev-parse', '--verify', '--end-of-options', `${args[3]}^{commit}`);
const schemaPath = 'dist/schema/bitrouter.config.schema.json';
const raw = `${git('show', `${revision}:${schemaPath}`)}\n`;
const schema = JSON.parse(raw);
const version = schema.$id?.match(/\/v([^/]+)\/config\.schema\.json$/)?.[1];
if (!schema.$defs || !schema.properties || !version) throw new Error('Unexpected upstream configuration schema');
const source = {
  repository: 'https://github.com/bitrouter/bitrouter',
  revision,
  schemaPath,
  version,
  sourceDate: git('show', '-s', '--format=%cI', revision),
  sha256: createHash('sha256').update(raw).digest('hex'),
};
mkdirSync('config-reference', { recursive: true });
writeFileSync('config-reference/schema.json', raw);
writeFileSync('config-reference/source.json', `${JSON.stringify(source, null, 2)}\n`);
console.log(`Captured config schema ${version} at ${revision.slice(0, 12)}. Run pnpm generate:config.`);
