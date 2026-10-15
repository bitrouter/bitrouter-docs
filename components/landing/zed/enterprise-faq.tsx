"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function EnterpriseFaq({ items }: { items: readonly { question: string; answer: ReactNode; id?: string }[] }) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const openLinkedAnswer = () => {
      const target = Array.from(section.current?.querySelectorAll<HTMLDetailsElement>("details[id]") ?? [])
        .find(item => item.id === window.location.hash.slice(1));
      if (target) target.open = true;
    };
    openLinkedAnswer();
    window.addEventListener("hashchange", openLinkedAnswer);
    return () => window.removeEventListener("hashchange", openLinkedAnswer);
  }, []);
  return <section ref={section} className="enterprise-faq" aria-labelledby="enterprise-faq-title">
    <h2 id="enterprise-faq-title">FAQ</h2>
    {items.map(item => <details key={item.question} id={item.id}>
      <summary>{item.question}<span aria-hidden="true">+</span></summary>
      <div className="enterprise-faq-answer">{item.answer}</div>
    </details>)}
  </section>;
}
