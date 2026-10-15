import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/zed/cta";
import "@/components/landing/zed/zed.css";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false, follow: false } };

export default function NewsletterPage() {
  return <main id="main"><FinalCta /></main>;
}
