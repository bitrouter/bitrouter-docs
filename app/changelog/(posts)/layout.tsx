import { DocsLayout } from "fumadocs-ui/layouts/flux";
import { changelogSource } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

export default function ChangelogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");

  return (
    <DocsLayout tree={changelogSource.getPageTree("en")} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
