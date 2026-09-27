import { NextResponse } from "next/server";
import { createNewsletterToken } from "@/lib/newsletter-token";
import { newsletterConfig, normalizeNewsletterEmail, resendRequest } from "@/lib/newsletter";
import { allowNewsletterConfirmation } from "@/lib/newsletter-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = newsletterConfig();
  if (!config) return NextResponse.json({ error: "Newsletter signup is unavailable." }, { status: 503 });
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return NextResponse.json({ error: "Invalid request." }, { status: 413 });
  }
  const origin = request.headers.get("origin");
  const allowedOrigins = [new URL(request.url).origin, new URL(config.siteUrl).origin];
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  let input: unknown;
  try {
    const body = await request.text();
    if (body.length > 2048) return NextResponse.json({ error: "Invalid request." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const fields = input as Record<string, unknown>;
  if (fields.website) return NextResponse.json({ ok: true });
  const email = normalizeNewsletterEmail(fields.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowNewsletterConfirmation(ip, email)) {
    return NextResponse.json({ error: "Please wait before requesting another confirmation email." }, { status: 429 });
  }

  const token = createNewsletterToken(email, config.tokenSecret);
  const confirmUrl = `${config.siteUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const privacyUrl = `${config.siteUrl}/privacy-policy`;
  try {
    const response = await resendRequest(config.apiKey, "/emails", {
      method: "POST",
      body: {
        from: config.from,
        to: [email],
        subject: "Confirm your BitRouter newsletter subscription",
        html: `<p>Confirm that you want to receive occasional routing insights and significant BitRouter updates.</p><p><a href="${confirmUrl}">Confirm subscription</a></p><p>By confirming, you agree to receive the BitRouter newsletter. You can unsubscribe at any time. See our <a href="${privacyUrl}">Privacy Policy</a>.</p><p>This link expires in 24 hours. If you did not request this, ignore this email.</p>`,
        text: `Confirm your BitRouter newsletter subscription: ${confirmUrl}\n\nBy confirming, you agree to receive the BitRouter newsletter. You can unsubscribe at any time. Privacy Policy: ${privacyUrl}\n\nThis link expires in 24 hours. If you did not request this, ignore this email.`,
      },
    });
    if (!response.ok) return NextResponse.json({ error: "Could not send confirmation. Try again later." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not send confirmation. Try again later." }, { status: 502 });
  }
}
