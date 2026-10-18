import { NextResponse } from "next/server";
import { enterpriseContactConfig, enterpriseContactSchema } from "../../../../lib/enterprise-contact";
import { resendRequest } from "../../../../lib/resend";
import { allowEnterpriseContact } from "../../../../lib/enterprise-contact-rate-limit";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  const origin = request.headers.get("origin");
  const origins = [new URL(request.url).origin, new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "https://bitrouter.ai").origin];
  if (origin && !origins.includes(origin)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 16_384) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  let fields: unknown;
  try {
    const text = await request.text();
    if (text.length > 16_384) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    fields = JSON.parse(text);
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (fields && typeof fields === "object" && "website" in fields && fields.website) return NextResponse.json({ ok: true });
  const parsed = enterpriseContactSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and describe your workload in at least 10 characters." }, { status: 400 });
  const config = enterpriseContactConfig();
  if (!config) return NextResponse.json({ error: "The form is currently unavailable. Please email contact@bitrouter.ai." }, { status: 503 });
  const input = parsed.data;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowEnterpriseContact(`enterprise:${ip}`, `enterprise:${input.email}`)) return NextResponse.json({ error: "Please wait before sending another request." }, { status: 429 });
  try {
    const response = await resendRequest(config.apiKey, "/emails", {
      method: "POST", body: {
        from: config.from, to: [config.to], reply_to: input.email,
        subject: `Enterprise inquiry: ${input.company}`,
        text: `Name: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company}\nRole: ${input.role}\n\nProblem to solve:\n${input.workload}`,
      },
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error("Delivery was not accepted");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "We couldn’t send your request. Please try again or email contact@bitrouter.ai." }, { status: 502 }); }
}
