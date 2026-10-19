import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { definitionAnchor, renderConfigReference, schemaProse } from './config-reference.mjs';

const fixture = (definitions) => ({
  properties: { server: { $ref: '#/$defs/Settings' } },
  $defs: { Settings: definitions },
});

describe('configuration reference contracts', () => {
  it('preserves false, zero, null, and empty defaults without inventing optional defaults', () => {
    const output = renderConfigReference(fixture({ properties: {
      authenticated: { type: 'boolean', default: false },
      attempts: { type: 'integer', default: 0, minimum: 0 },
      fallback: { type: ['string', 'null'], default: null },
      tags: { type: 'array', items: { type: 'string' }, default: [] },
      inferred: { type: 'string' },
    }, required: ['attempts'] }));
    expect(output).toContain('| `authenticated` | `boolean` | No | `false` |');
    expect(output).toContain('| `attempts` | `integer` | Yes | `0` |');
    expect(output).toContain('- `attempts` — `minimum`: `0`');
    expect(output).toContain('| `fallback` | `string` or `null` | No | `null` |');
    expect(output).toContain('| `tags` | Array of `string` | No | `[]` |');
    expect(output).toContain('| `inferred` | `string` | No | Not declared |');
  });

  it('keeps tagged alternatives and their different required fields separate', () => {
    const output = renderConfigReference(fixture({ oneOf: [
      { properties: { type: { const: 'http' }, url: { type: 'string' } }, required: ['type', 'url'] },
      { properties: { type: { const: 'stdio' }, command: { type: 'string' }, args: { type: 'array' } }, required: ['type', 'command'] },
    ] }));
    expect(output).toContain('Exactly one of the following shapes:');
    expect(output).toContain('**`type: "http"`**');
    expect(output).toContain('| `url` | `string` | Yes |');
    expect(output).toContain('**`type: "stdio"`**');
    expect(output).toContain('| `command` | `string` | Yes |');
    expect(output).toContain('| `args` | Array of Any JSON value | No |');
  });

  it('rejects broken references and unassigned new root configuration', () => {
    expect(() => renderConfigReference({ properties: { server: { $ref: '#/$defs/Missing' } }, $defs: {} })).toThrow('Missing schema definition');
    expect(() => renderConfigReference({ properties: { new_feature: { type: 'string' } }, $defs: {} })).toThrow('Unassigned configuration');
  });

  it('renders every snapshot field and definition with resolvable type links', () => {
    const schema = JSON.parse(readFileSync('config-reference/schema.json', 'utf8'));
    const output = renderConfigReference(schema);
    let fieldCount = 0;
    function count(node) {
      if (!node || typeof node !== 'object') return;
      if (node.properties) fieldCount += Object.keys(node.properties).length;
      for (const value of Object.values(node)) count(value);
    }
    count(schema);
    expect(output.split('\n').filter((line) => line.startsWith('| `'))).toHaveLength(fieldCount);
    for (const name of Object.keys(schema.$defs)) {
      const anchor = definitionAnchor(name);
      const heading = output.split('\n').find((line) => line.startsWith('### ') && line.slice(4).toLowerCase().replace(/ /g, '-') === anchor);
      expect(heading, name).toBeDefined();
    }
    expect(output).not.toMatch(/\]\(Self::/);
  });

  it('makes source descriptions safe for import-free MDX without breaking inline code', () => {
    const result = schemaProse('Use <T> with {scope}; [`field`](Self::field). Keep `${KEY}`.');
    expect(result).toContain('&lt;T&gt; with &#123;scope&#125;');
    expect(result).toContain('`field`');
    expect(result).toContain('`${KEY}`');
    expect(result).not.toContain('Self::');
    expect(schemaProse('Tag: `type: "http" | "stdio"`.')).toBe('Tag: `type: "http" | "stdio"`.');
  });
});
