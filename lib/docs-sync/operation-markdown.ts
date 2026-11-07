import type { OpenAPIV3_1 as API } from "fumadocs-openapi";

const METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

function resolve<T>(document: API.Document, value: T | API.ReferenceObject | undefined): T | undefined {
  const visited = new Set<string>();
  while (value && typeof value === "object" && "$ref" in value) {
    const ref = value.$ref;
    if (typeof ref !== "string" || !ref.startsWith("#/") || visited.has(ref)) return;
    visited.add(ref);
    let node: unknown = document;
    for (const segment of ref.slice(2).split("/")) {
      const key = segment.replaceAll("~1", "/").replaceAll("~0", "~");
      node = node && typeof node === "object" && Object.hasOwn(node, key)
        ? (node as Record<string, unknown>)[key]
        : undefined;
    }
    value = node as typeof value;
  }
  return value as T | undefined;
}

function credentials(document: API.Document, operation: API.OperationObject) {
  const requirements = operation.security ?? document.security;
  if (!requirements?.length) return "Public.";
  return requirements.map((requirement) => {
    const schemes = Object.entries(requirement).map(([name, scopes]) => {
      const scheme = resolve<API.SecuritySchemeObject>(document, document.components?.securitySchemes?.[name]);
      const header = scheme?.type === "http" && scheme.scheme?.toLowerCase() === "bearer"
        ? "`Authorization: Bearer <token>`"
        : scheme?.type === "apiKey"
          ? `${scheme.in} parameter \`${scheme.name}\``
          : `\`${name}\``;
      const scope = scopes.length ? ` (scopes: ${scopes.join(", ")})` : "";
      return `${header}${scope}`;
    });
    return schemes.join(" and ") || "Anonymous access";
  }).join(" or ") + ".";
}

export function indexOperationMarkdown(document: API.Document) {
  const rendered = new Map<string, string>();
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    if (!item) continue;
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation?.operationId) continue;
      const body = resolve<API.RequestBodyObject>(document, operation.requestBody);
      const json = body?.content?.["application/json"];
      const schema = resolve<API.SchemaObject>(document, json?.schema);
      const server = (operation.servers ?? item.servers ?? document.servers)?.[0]?.url;
      const lines = [
        `\`${method.toUpperCase()} ${path}\``,
        operation.description ?? "",
        "## Authentication",
        credentials(document, operation),
      ];
      if (server) lines.push(`Base URL: \`${server}\``);
      const parameters = new Map<string, API.ParameterObject>();
      for (const entry of [...(item.parameters ?? []), ...(operation.parameters ?? [])]) {
        const parameter = resolve<API.ParameterObject>(document, entry);
        if (parameter) parameters.set(`${parameter.in}:${parameter.name}`, parameter);
      }
      if (parameters.size) {
        lines.push("## Parameters", [...parameters.values()].map((parameter) =>
          `- \`${parameter.name}\` (${parameter.in}${parameter.required ? ", required" : ""})${parameter.description ? `: ${parameter.description}` : ""}`).join("\n"));
      }
      if (body?.content) {
        lines.push("## Request body", body.description ?? "", `Media types: ${Object.keys(body.content).map((type) => `\`${type}\``).join(", ")}.`);
        if (typeof schema === "object" && "properties" in schema && schema.properties) {
          lines.push(Object.entries(schema.properties).map(([name, value]) => {
            const field = resolve<API.SchemaObject>(document, value);
            const required = schema.required?.includes(name) ? " (required)" : "";
            const type = typeof field === "object" && field.type ? `: ${[field.type].flat().join(" | ")}` : "";
            return `- \`${name}\`${required}${type}`;
          }).join("\n"));
        }
        const example = json?.example;
        if (example !== undefined) {
          lines.push("### Example JSON request", `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``);
        }
      }
      const responses = Object.entries(operation.responses ?? {}).map(([status, entry]) => {
        const response = resolve<API.ResponseObject>(document, entry);
        const media = Object.keys(response?.content ?? {});
        return `- \`${status}\` ${response?.description?.replace(/\s+/g, " ").trim() ?? ""}${media.length ? ` (${media.join(", ")})` : ""}`;
      });
      if (responses.length) lines.push("## Responses", responses.join("\n"));
      lines.push("[Full OpenAPI schema](/openapi.json)");
      rendered.set(operation.operationId, lines.filter(Boolean).join("\n\n"));
    }
  }
  return rendered;
}
