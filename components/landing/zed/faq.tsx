"use client";

import { useState } from "react";
import { FAQS } from "./data";
import { Kicker } from "./primitives";

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
    <section className="zed-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="zed-wrap" style={{ padding: "88px 34px" }}>
        <div
          className="zed-grid-2"
          style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "start" }}
        >
          <div style={{ position: "sticky", top: 88 }}>
            <Kicker>// faq</Kicker>
            <h2 className="zed-display" style={{ fontSize: 44, lineHeight: 1.06, margin: "16px 0 0" }}>
              Questions.
            </h2>
          </div>
          <div style={{ borderTop: "1px solid var(--z-rule)" }}>
            {FAQS.map((f, i) => {
              const isOpen = i === open;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--z-rule)" }}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    style={{
                      display: "flex",
                      gap: 14,
                      width: "100%",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      padding: "22px 0",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 15,
                      color: isOpen ? "var(--z-ink)" : "var(--z-ink-2)",
                    }}
                  >
                    <span style={{ color: "var(--z-blue)", width: 12, flex: "0 0 auto" }}>{isOpen ? "−" : "+"}</span>
                    {f.q}
                  </button>
                  <div className={`zed-faq-ans${isOpen ? " open" : ""}`}>
                    <div>
                      <div
                        style={{
                          padding: "0 0 22px 26px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: "var(--z-ink-4)",
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
