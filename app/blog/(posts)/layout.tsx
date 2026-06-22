import { DocsLayout } from "fumadocs-ui/layouts/flux";
import { blogSource } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");

  return (
    <DocsLayout tree={blogSource.getPageTree("en")} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
