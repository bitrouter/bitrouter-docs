"use client";

import { useState } from "react";
import { FAQS } from "./data";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="zed-wrap zed-sec">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div>
        <div
          className="zed-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            columnGap: 72,
            rowGap: 32,
            alignItems: "start",
          }}
        >
          <h2 className="zed-display" style={{ fontSize: 40, lineHeight: 1.08 }}>
            Questions.
          </h2>
          <div style={{ borderTop: "1px solid var(--z-rule)" }}>
            {FAQS.map((f, i) => {
              const isOpen = i === open;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--z-rule)" }}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    style={{
                      display: "flex",
                      gap: 16,
                      width: "100%",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      padding: "24px 0",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 14.5,
                      color: isOpen ? "var(--z-ink)" : "var(--z-ink-2)",
                    }}
                  >
                    <span style={{ color: "var(--z-ink-6)", width: 12, flex: "0 0 auto" }}>{isOpen ? "−" : "+"}</span>
                    {f.q}
                  </button>
                  <div className={`zed-faq-ans${isOpen ? " open" : ""}`}>
                    <div>
                      <div
                        style={{
                          padding: "0 0 24px 28px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          lineHeight: 1.8,
                          color: "var(--z-ink-5)",
                          maxWidth: "62ch",
                        }}
                      >
                        {f.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
