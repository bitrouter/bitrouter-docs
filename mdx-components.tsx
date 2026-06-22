import defaultMdxComponents from "fumadocs-ui/mdx";
import { APIPage } from "@/components/docs/api-page";
import { CalButton } from "@/components/landing/sections/CalButton";
import { CalInline } from "@/components/landing/sections/CalInline";
import { ModelsTable } from "@/components/docs/models-table";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    APIPage,
    CalButton,
    CalInline,
    ModelsTable,
    ...components,
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getMDXComponents(components);
}
