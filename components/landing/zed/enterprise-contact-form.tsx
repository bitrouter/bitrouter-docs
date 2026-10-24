"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";

export function EnterpriseContactForm({ available }: { available: boolean }) {
  const pending = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || pending.current) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    pending.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/enterprise/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields), signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "We couldn’t send your request. Please try again or email us.");
      setStatus("sent");
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "We couldn’t send your request. Please try again or email us.");
      setStatus("error");
    } finally { pending.current = false; }
  }

  return <>
    <p className="enterprise-eyebrow">Let&apos;s talk</p>
    <h2 id="enterprise-form-title">Tell us about<br /><em>your workload.</em></h2>
    <p className="enterprise-form-intro">Share what your team is building and where you need help. We&apos;ll follow up by email.</p>
    {status === "sent" ? <div className="enterprise-form-success" role="status"><Check size={22} aria-hidden="true" /><h3>Thanks for reaching out.</h3><p>Our team will review your request and follow up by email.</p></div> :
      <form onSubmit={submit} aria-labelledby="enterprise-form-title">
        <fieldset disabled={status === "sending"}>
          <label htmlFor="enterprise-name">Name<input id="enterprise-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name" /></label>
          <label htmlFor="enterprise-email">Work email<input id="enterprise-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></label>
          <label htmlFor="enterprise-company">Company<input id="enterprise-company" name="company" autoComplete="organization" required maxLength={150} placeholder="Company name" /></label>
          <label htmlFor="enterprise-role">Role<input id="enterprise-role" name="role" autoComplete="organization-title" required maxLength={100} placeholder="Your role" /></label>
          <label htmlFor="enterprise-workload">What problem are you trying to solve?<textarea id="enterprise-workload" name="workload" required minLength={10} maxLength={3000} rows={4} placeholder="Model costs, time spent waiting, private deployment, or something else…" /></label>
          <div className="enterprise-form-trap" aria-hidden="true"><label htmlFor="enterprise-website">Website<input id="enterprise-website" name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="enterprise-form-privacy">By submitting, you agree that we may contact you about this request. See our <Link href="/docs/privacy-policy">Privacy Policy</Link>.</p>
          <button className="enterprise-submit" type="submit" disabled={!available || status === "sending"}>{status === "sending" ? "Sending…" : "Talk to the founders"}<ArrowUpRight size={16} aria-hidden="true" /></button>
        </fieldset>
        {status === "error" && <p className="enterprise-form-error" role="alert">{error}</p>}
        <p className="enterprise-form-alternative">{available ? "Prefer email? " : "The form is currently unavailable. Email "}<a href="mailto:contact@bitrouter.ai">contact@bitrouter.ai</a>.</p>
      </form>}
  </>;
}
