import { z } from "zod";

const docPath = z
  .string()
  .max(1000)
  .regex(/^\/docs(?:\/[a-zA-Z0-9_().~-]+)*\/?$/, "Use a documentation path.");
const message = z.string().trim().min(1).max(5000);
export const blockFeedback = z.object({
  url: docPath,
  blockId: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-zA-Z0-9_-]+$/),
  message,
  blockBody: z.string().trim().min(1).max(5000),
  // IDs are content/order dependent; retain the quote and reported page revision.
  version: z.string().max(100).optional(),
});
export const pageFeedback = z.object({
  opinion: z.enum(["good", "bad"]),
  url: docPath,
  message,
});
export const actionResponse = z.object({ githubUrl: z.url().optional() });
export type BlockFeedback = z.infer<typeof blockFeedback>;
export type PageFeedback = z.infer<typeof pageFeedback>;
export type ActionResponse = z.infer<typeof actionResponse>;
