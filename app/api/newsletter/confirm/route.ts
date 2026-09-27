import { NextResponse } from "next/server";
import { newsletterConfig, normalizeNewsletterEmail, resendRequest } from "@/lib/newsletter";
import { readNewsletterToken } from "@/lib/newsletter-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = newsletterConfig();
  if (!config) return new Response("Newsletter signup is unavailable.", { status: 503 });
  const origin = request.headers.get("origin");
  const allowedOrigins = [new URL(request.url).origin, new URL(config.siteUrl).origin];
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response("Invalid request.", { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 4096) {
    return new Response("Invalid request.", { status: 413 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  const token = form.get("token");
  const email = typeof token === "string" && token.length < 2048
    ? readNewsletterToken(token, config.tokenSecret)
    : null;
  const confirmedEmail = normalizeNewsletterEmail(email);
  if (!confirmedEmail) return NextResponse.json({ status: "expired" }, { status: 400 });

  try {
    const contact = await resendRequest(config.apiKey, `/contacts/${encodeURIComponent(confirmedEmail)}`);
    if (contact.ok) {
      const data = await contact.json() as { unsubscribed?: boolean };
      if (data.unsubscribed === true) {
        return NextResponse.json({ status: "unsubscribed" }, { status: 409 });
      }
      if (data.unsubscribed !== false) throw new Error("contact status unavailable");
      const add = await resendRequest(
        config.apiKey,
        `/contacts/${encodeURIComponent(confirmedEmail)}/segments/${encodeURIComponent(config.segmentId)}`,
        { method: "POST" },
      );
      if (!add.ok && add.status !== 409) throw new Error("segment add failed");
    } else if (contact.status === 404) {
      const create = await resendRequest(config.apiKey, "/contacts", {
        method: "POST",
        body: { email: confirmedEmail, unsubscribed: false, segments: [{ id: config.segmentId }] },
      });
      if (!create.ok) throw new Error("contact create failed");
    } else {
      throw new Error("contact lookup failed");
    }
    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
