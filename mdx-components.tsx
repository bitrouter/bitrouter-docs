import defaultMdxComponents from "fumadocs-ui/mdx";
import { APIPage } from "@/components/docs/api-page";
import { CalButton } from "@/components/landing/sections/CalButton";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    APIPage,
    CalButton,
    ...components,
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getMDXComponents(components);
}
