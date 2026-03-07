import { DocsLayout } from "fumadocs-ui/layouts/flux";
import { blogSource } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BlogLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DocsLayout tree={blogSource.getPageTree(locale)} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
