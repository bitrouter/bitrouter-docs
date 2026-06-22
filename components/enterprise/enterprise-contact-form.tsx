"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function EnterpriseContactForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    // POST to a future API route or external service.
    // For now, log and show the success state.
    console.log("Enterprise inquiry:", Object.fromEntries(data));

    const email = data.get("email") as string | null;
    if (email) {
      posthog.identify(email, {
        email,
        name: data.get("name") as string | undefined,
        company: data.get("company") as string | undefined,
        role: data.get("role") as string | undefined,
      });
    }

    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    setSubmitted(true);
    posthog.capture("enterprise_contact_form_submitted");
  }

  if (submitted) {
    return (
      <div className="border border-border p-6">
        <p className="text-sm font-medium">Thanks for reaching out.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="name" required className="rounded-none" />
        </Field>
        <Field label="Role">
          <Input name="role" className="rounded-none" />
        </Field>
      </div>

      <Field label="Company">
        <Input name="company" required className="rounded-none" />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Company email">
          <Input name="email" type="email" required className="rounded-none" />
        </Field>
        <Field label="Phone number">
          <Input name="phone" type="tel" className="rounded-none" />
        </Field>
      </div>

      <Field label="What problem are you trying to solve?">
        <textarea
          name="message"
          rows={5}
          className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </Field>

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="rounded-none"
      >
        {pending ? "Sending..." : "Send"}
        {!pending && <ArrowRight className="ml-1 size-4" />}
      </Button>
    </form>
  );
}
