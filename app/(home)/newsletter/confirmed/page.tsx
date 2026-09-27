import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Newsletter subscription", robots: { index: false } };

const MESSAGES = {
  success: ["You’re subscribed.", "Thanks for confirming. You’ll receive occasional BitRouter updates."],
  expired: ["Link expired or invalid.", "Please submit your email again to get a new confirmation link."],
  unsubscribed: ["Subscription not changed.", "This address previously unsubscribed. Contact us if you want to rejoin."],
  error: ["We couldn’t finish signup.", "Please try again later or contact us."],
} as const;

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [heading, message] = MESSAGES[status as keyof typeof MESSAGES] ?? MESSAGES.error;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">{heading}</h1>
      <p className="mt-5 text-muted-foreground">{message}</p>
      <Link href="/" className="mt-8 underline underline-offset-4">Back to BitRouter</Link>
    </div>
  );
}
