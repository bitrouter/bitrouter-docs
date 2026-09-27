"use client";

import { useEffect, useState, type FormEvent } from "react";

type NewsletterState = "signup" | "awaiting" | "confirm" | "confirmed" | "unsubscribed";

/** The closing action is an explicit newsletter opt-in. */
export function FinalCta() {
  const [state, setState] = useState<NewsletterState>("signup");
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const confirmation = params.get("newsletter-confirm");
    const legacyStatus = params.get("newsletter-status");
    if (!confirmation && !legacyStatus) return;

    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#newsletter`);
    document.getElementById("newsletter")?.scrollIntoView({ block: "center" });

    if (confirmation && confirmation.length < 2048) {
      setToken(confirmation);
      setState("confirm");
    } else if (legacyStatus === "success") {
      setState("confirmed");
      setMessage("Thanks for confirming. You’ll receive occasional BitRouter updates.");
    } else if (legacyStatus === "unsubscribed") {
      setState("unsubscribed");
      setMessage("This address previously unsubscribed. Contact us if you want to rejoin.");
    } else {
      setMessage("This confirmation link expired or could not be used. Enter your email to request a new one.");
    }
  }, []);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const fields = new FormData(event.currentTarget);
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
      setState("awaiting");
      setMessage("Check your inbox and confirm your subscription. The link expires in 24 hours.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send confirmation. Try again later.");
    } finally {
      setPending(false);
    }
  }

  async function confirm() {
    if (!token) return;
    setPending(true);
    setMessage("");
    const form = new FormData();
    form.set("token", token);
    try {
      const response = await fetch("/api/newsletter/confirm", { method: "POST", body: form });
      const result = await response.json() as { status?: string };
      if (response.ok && result.status === "success") {
        setToken(null);
        setState("confirmed");
        setMessage("Thanks for confirming. You’ll receive occasional BitRouter updates.");
      } else if (result.status === "expired") {
        setToken(null);
        setState("signup");
        setMessage("This confirmation link expired. Enter your email to request a new one.");
      } else if (result.status === "unsubscribed") {
        setToken(null);
        setState("unsubscribed");
        setMessage("This address previously unsubscribed. Contact us if you want to rejoin.");
      } else {
        setMessage("We couldn’t finish signup. Try confirming again.");
      }
    } catch {
      setMessage("We couldn’t finish signup. Try confirming again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="newsletter" className="zed-wrap zed-sec zed-sec-b zed-final-cta" style={{ textAlign: "center" }}>
      <p className="zed-newsletter-eyebrow">THE BITROUTER NEWSLETTER</p>
      <h2 className="zed-display zed-newsletter-title">Better routes, in your inbox.</h2>
      <p className="zed-newsletter-description">
        Occasional routing insights and significant BitRouter updates. No routine release noise.
      </p>

      {state === "confirm" || state === "confirmed" || state === "unsubscribed" ? (
        <div className="zed-newsletter-action">
          <button
            className="zed-btn zed-btn-primary"
            type="button"
            onClick={confirm}
            disabled={pending || state !== "confirm"}
          >
            {pending ? "Confirming…" : state === "confirmed" ? "Subscribed" : state === "unsubscribed" ? "Not subscribed" : "Confirm subscription"}
          </button>
          {message && <p className="zed-newsletter-status" role={state === "confirm" ? "alert" : "status"}>{message}</p>}
        </div>
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
              disabled={state === "awaiting"}
            />
            <button className="zed-btn zed-btn-primary" type="submit" disabled={pending || state === "awaiting"}>
              {pending ? "Sending…" : state === "awaiting" ? "Check your inbox" : "Subscribe"}
            </button>
          </div>
          <div className="zed-newsletter-honeypot" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {message && <p className="zed-newsletter-status" role={state === "awaiting" ? "status" : "alert"}>{message}</p>}
        </form>
      )}
    </section>
  );
}
