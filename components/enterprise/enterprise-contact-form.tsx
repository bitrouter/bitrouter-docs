"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501+"] as const;

export function EnterpriseContactForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    // POST to a future API route or external service
    // For now, log and show success state
    console.log("Enterprise inquiry:", Object.fromEntries(data));

    // Simulate submission
    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-border p-6">
        <p className="text-sm font-medium">Thanks for reaching out.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Full Name
        </label>
        <Input
          name="name"
          placeholder="Your name"
          required
          className="rounded-none"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Company Email
        </label>
        <Input
          name="email"
          type="email"
          placeholder="name@company.com"
          required
          className="rounded-none"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Company
        </label>
        <Input
          name="company"
          placeholder="Company name"
          required
          className="rounded-none"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Company Size
        </label>
        <select
          name="size"
          required
          defaultValue=""
          className="h-9 w-full border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="" disabled>
            Select
          </option>
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          What do you need help with?
        </label>
        <textarea
          name="message"
          placeholder="Tell us about your project and requirements..."
          rows={4}
          className="w-full border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-none"
        size="lg"
      >
        {pending ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}
