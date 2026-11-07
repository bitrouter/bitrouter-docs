// Render the pinned JSON Schema without guessing missing defaults or flattening
// tagged unions (which would lose branch-specific required fields).
const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const words = (name) => name.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ');
export const definitionAnchor = (name) => words(name).toLowerCase().replace(/ /g, '-');
const code = (value) => {
  const content = String(value);
  const delimiter = '`'.repeat(Math.max(0, ...[...content.matchAll(/`+/g)].map(([run]) => run.length)) + 1);
  const padding = content.startsWith('`') || content.endsWith('`') ? ' ' : '';
  return `${delimiter}${padding}${content}${padding}${delimiter}`;
};

export function schemaProse(value = '') {
  return value
    .replace(/\[(`[^`]+`)\](?:\([^)]*\))?/g, '$1') // Rustdoc links have no web target.
    .split(/(`[^`]*`)/g)
    .map((part, i) => i % 2 ? part : part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/{/g, '&#123;').replace(/}/g, '&#125;'))
    .join('')
    .replace(/\s+/g, ' ').trim();
}

function definition(schema, ref) {
  if (!ref.startsWith('#/$defs/')) throw new Error(`Unsupported schema reference: ${ref}`);
  const name = ref.slice('#/$defs/'.length);
  if (!has(schema.$defs, name)) throw new Error(`Missing schema definition: ${name}`);
  return name;
}

function typeOf(node, schema) {
  if (node === true) return 'Any JSON value';
  if (node === false) return 'Not allowed';
  if (node.$ref) {
    const name = definition(schema, node.$ref);
    return `[${words(name)}](#${definitionAnchor(name)})`;
  }
  if (has(node, 'const')) return code(JSON.stringify(node.const));
  if (node.enum) return node.enum.map((v) => code(JSON.stringify(v))).join(' or ');
  if (node.oneOf || node.anyOf) return (node.oneOf ?? node.anyOf).map((n) => typeOf(n, schema)).join(' or ');
  if (Array.isArray(node.type)) return node.type.map(code).join(' or ');
  if (node.type === 'array') {
    const itemConstraints = constraints(node.items ?? {});
    return `Array of ${typeOf(node.items ?? true, schema)}${itemConstraints ? ` (${itemConstraints})` : ''}`;
  }
  if (node.type === 'object' && node.additionalProperties && !node.properties) {
    return `Map of ${code('string')} → ${typeOf(node.additionalProperties, schema)}`;
  }
  return code(node.type ?? 'any');
}

function constraints(node) {
  return ['format', 'minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'minItems', 'maxItems']
    .filter((key) => has(node, key))
    .map((key) => `${code(key)}: ${code(node[key])}`).join('; ');
}

function table(node, schema) {
  if (!node.properties) return '';
  const required = new Set(node.required ?? []);
  const lines = ['| Field | Type | Required | Schema default |', '| --- | --- | --- | --- |'];
  const descriptions = [];
  for (const [field, value] of Object.entries(node.properties)) {
    const target = value.$ref ? schema.$defs[definition(schema, value.$ref)] : value;
    const defaultNode = has(value, 'default') ? value : target;
    const defaultValue = has(defaultNode, 'default') ? code(JSON.stringify(defaultNode.default)) : 'Not declared';
    const description = [schemaProse(value.description), constraints(value)].filter(Boolean).join(' ');
    const cells = [code(field), typeOf(value, schema), required.has(field) ? 'Yes' : 'No', defaultValue];
    lines.push(`| ${cells.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |`);
    if (description) descriptions.push(`- ${code(field)} — ${description}`);
  }
  return [lines.join('\n'), descriptions.join('\n')].filter(Boolean).join('\n\n');
}

function shape(node, schema) {
  const output = [];
  if (node.description) output.push(schemaProse(node.description));
  if (node.properties) {
    if (node.additionalProperties === false) output.push('Unknown fields are rejected in this object.');
    output.push(table(node, schema));
  } else if (!(node.oneOf || node.anyOf)) {
    output.push(`Accepted value: ${typeOf(node, schema)}.`);
    if (constraints(node)) output.push(constraints(node));
    if (has(node, 'default')) output.push(`Schema default: ${code(JSON.stringify(node.default))}.`);
  }
  const branches = node.oneOf ?? node.anyOf;
  if (branches) {
    output.push(node.oneOf ? 'Exactly one of the following shapes:' : 'Accepts the following alternatives:');
    for (const [i, branch] of branches.entries()) {
      const discriminator = Object.entries(branch.properties ?? {}).find(([, value]) => has(value, 'const'));
      const label = discriminator ? `${discriminator[0]}: ${JSON.stringify(discriminator[1].const)}` : `Alternative ${i + 1}`;
      output.push(`**${code(label)}**`, shape(branch, schema));
    }
  }
  return output.filter(Boolean).join('\n\n');
}

// Groups match what a local operator configures. Each definition is rendered
// once; shared types link to their first owning group.
const GROUPS = [
  ['Server and connections', ['server', 'upstream', 'database', 'control', 'agent_api']],
  ['Providers and models', ['providers', 'models', 'registry', 'presets', 'variants', 'inherit_defaults']],
  ['Routing and decisions', ['routers', 'checkers', 'policy', 'decision_model', 'eval']],
  ['Agents and MCP', ['agents', 'chat', 'mcp', 'mcp_servers', 'server_tools']],
  ['Retention and recording', ['trajectory', 'acp_recording', 'continuation']],
];

export function renderConfigReference(schema) {
  const seen = new Set();
  function references(node, found = new Set()) {
    if (!node || typeof node !== 'object') return found;
    if (node.$ref) found.add(definition(schema, node.$ref));
    for (const [key, value] of Object.entries(node)) {
      if (key !== '$defs') references(value, found);
    }
    return found;
  }
  // Check even currently unreachable definitions for broken refs.
  references(schema.$defs);
  const sections = ['## Top-level fields', 'These keys belong directly in `bitrouter.yaml`. Unknown top-level keys are rejected.', table(schema, schema)];
  for (const [heading, keys] of GROUPS) {
    const queue = [...keys.flatMap((key) => [...references(schema.properties[key])])];
    const rendered = [];
    for (let i = 0; i < queue.length; i++) {
      const name = queue[i];
      if (seen.has(name)) continue;
      seen.add(name);
      const node = schema.$defs[name];
      rendered.push(`### ${words(name)}`, shape(node, schema));
      queue.push(...references(node));
    }
    if (rendered.length) sections.push(`## ${heading}`, ...rendered);
  }
  const missingFields = Object.keys(schema.properties).filter((key) => !GROUPS.some(([, keys]) => keys.includes(key)) && key !== 'plugins');
  const missingTypes = Object.keys(schema.$defs).filter((name) => !seen.has(name));
  if (missingFields.length || missingTypes.length) {
    throw new Error(`Unassigned configuration fields/types: ${[...missingFields, ...missingTypes].join(', ')}`);
  }
  return `${sections.filter(Boolean).join('\n\n')}\n`;
}
