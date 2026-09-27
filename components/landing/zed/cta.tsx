"use client";

import { useState, type FormEvent } from "react";

/** The closing action is an explicit newsletter opt-in. */
export function FinalCta() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fields.get("email"),
          website: fields.get("website"),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not send confirmation.");
      setSent(true);
      setMessage("Check your inbox and confirm your subscription. The link expires in 24 hours.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send confirmation. Try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="zed-wrap zed-sec zed-sec-b zed-final-cta" style={{ textAlign: "center" }}>
      <p className="zed-newsletter-eyebrow">THE BITROUTER NEWSLETTER</p>
      <h2 className="zed-display zed-newsletter-title">Better routes, in your inbox.</h2>
      <p className="zed-newsletter-description">
        Occasional routing insights and significant BitRouter updates. No routine release noise.
      </p>

      {sent ? (
        <p className="zed-newsletter-status" role="status">{message}</p>
      ) : (
        <form className="zed-newsletter-form" onSubmit={subscribe}>
          <div className="zed-newsletter-input-row">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              maxLength={254}
              required
            />
            <button className="zed-btn zed-btn-primary" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Subscribe"}
            </button>
          </div>
          <div className="zed-newsletter-honeypot" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {message && <p className="zed-newsletter-status" role="alert">{message}</p>}
        </form>
      )}
    </section>
  );
}
