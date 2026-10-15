"use client";

import { useEffect } from "react";

/** Existing emailed links keep their explicit confirmation flow. */
export function NewsletterReturn() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    if (hash === "#newsletter" || params.has("newsletter-confirm") || params.has("newsletter-status")) {
      window.location.replace(`/newsletter${hash}`);
    }
  }, []);
  return null;
}
