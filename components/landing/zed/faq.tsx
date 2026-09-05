"use client";

import { useState } from "react";
import { Kicker } from "./primitives";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqProps {
  items: FaqItem[];
  /** Left-column headline. */
  heading: string;
  /** Optional uppercase kicker above the headline. */
  kicker?: string;
  /** Optional lead paragraph under the headline. */
  lead?: string;
  /** Pin the left column while the list scrolls — for long lists. */
  sticky?: boolean;
  /** Emit FAQPage JSON-LD. One page should own the structured data. */
  jsonLd?: boolean;
}

/**
 * The site's one FAQ accordion — landing, pricing, enterprise and startup all
 * render this. Presentation lives in zed.css (.zed-faq*); only the copy and the
 * left-column shape differ per page.
 */
export function Faq({ items, heading, kicker, lead, sticky, jsonLd }: FaqProps) {
  const [open, setOpen] = useState(0);
  return (
    <div className="zed-faq">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: items.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      )}
      <div className={sticky ? "zed-faq-side-sticky" : undefined}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2
          className="zed-display"
          style={{ fontSize: 40, lineHeight: 1.08, margin: kicker ? "20px 0 0" : 0 }}
        >
          {heading}
        </h2>
        {lead && <p className="zed-lead">{lead}</p>}
      </div>
      <div className="zed-faq-list">
        {items.map((f, i) => {
          const isOpen = i === open;
          return (
            <div key={f.q} className="zed-faq-item">
              <button
                className="zed-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="zed-faq-sign" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
                {f.q}
              </button>
              <div className={`zed-faq-ans${isOpen ? " open" : ""}`}>
                <div>
                  <div className="zed-faq-a">{f.a}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
