import { z } from "zod";

const singleLine = (max: number) => z.string().trim().min(1).max(max).refine(value => !/[\r\n\x00]/.test(value));
export const enterpriseContactSchema = z.object({
  name: singleLine(100),
  email: z.string().trim().max(254).pipe(z.email()).transform(value => value.toLowerCase()),
  company: singleLine(150),
  role: singleLine(100),
  workload: z.string().trim().min(10).max(3000),
});

export function enterpriseContactConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_ENTERPRISE_FROM || process.env.RESEND_NEWSLETTER_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from, to: "contact@bitrouter.ai" };
}
