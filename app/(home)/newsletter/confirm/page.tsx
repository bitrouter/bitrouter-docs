import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirm newsletter subscription", robots: { index: false } };

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Confirm your subscription</h1>
      <p className="mt-5 text-muted-foreground">Get occasional routing insights and significant BitRouter updates.</p>
      {token ? (
        <form action="/api/newsletter/confirm" method="post" className="mt-8">
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="rounded bg-foreground px-6 py-3 text-background">Confirm subscription</button>
        </form>
      ) : (
        <p className="mt-8">This confirmation link is incomplete.</p>
      )}
      <Link href="/" className="mt-8 underline underline-offset-4">Back to BitRouter</Link>
    </div>
  );
}
