"use client";

/* Cost calculator — mono/dev styling.
   Focus: how much you save by switching a closed/frontier model for an
   open-source model on BitRouter, at each model's official list price.

   UI ONLY. Prices below are PLACEHOLDERS (blended $/Mtok) so the component is
   reviewable and reactive — swap FRONTIER / OPEN for the live /models pricing.
   Everything the UI reads comes out of `estimate()`, so replacing the price
   tables (and that one function) is the whole integration. */

import * as React from "react";
import posthog from "posthog-js";

type Priced = { key: string; label: string; price: number }; // price = $ / Mtok, blended

// PLACEHOLDER official list prices ($ per million tokens, blended in/out).
const FRONTIER: Priced[] = [
  { key: "opus", label: "Claude Opus 4.8", price: 30 },
  { key: "gpt5", label: "GPT-5", price: 20 },
  { key: "gemini", label: "Gemini 3.1 Pro", price: 15 },
  { key: "grok", label: "Grok 4.3", price: 18 },
];

const OPEN: Priced[] = [
  { key: "qwen", label: "Qwen 3.7", price: 0.6 },
  { key: "minimax", label: "MiniMax M3", price: 0.7 },
  { key: "glm", label: "GLM 5.1", price: 0.9 },
  { key: "kimi", label: "Kimi K2.6", price: 1.0 },
  { key: "deepseek", label: "DeepSeek V4 Pro", price: 1.2 },
];

function estimate(fromPrice: number, toPrice: number, tokensM: number) {
  const fromCost = Math.round(fromPrice * tokensM);
  const toCost = Math.round(toPrice * tokensM);
  const save = Math.max(0, fromCost - toCost);
  const pct = fromCost > 0 ? Math.round((save / fromCost) * 100) : 0;
  return { fromCost, toCost, save, pct };
}

function money(n: number) {
  return "$" + n.toLocaleString("en-US");
}
function tokens(m: number) {
  return m >= 1000 ? (m / 1000).toFixed(m % 1000 === 0 ? 0 : 1) + "B" : m + "M";
}

export function CostCalculator() {
  const [from, setFrom] = React.useState(FRONTIER[0]);
  const [to, setTo] = React.useState(OPEN[0]);
  const [tok, setTok] = React.useState(100); // million tokens / month

  const r = estimate(from.price, to.price, tok);

  return (
    <div className="calc">
      <div className="term-bar">
        <div className="term-dots">
          <i />
          <i />
          <i />
        </div>
        <span className="term-title">cost-calculator — closed vs open</span>
        <span className="term-sub">official list prices</span>
      </div>

      <div className="calc-body">
        {/* ── inputs ── */}
        <div className="calc-inputs">
          <div className="calc-field">
            <span className="calc-label">You&rsquo;re running</span>
            <select
              className="calc-select"
              value={from.key}
              onChange={(e) => {
                const m = FRONTIER.find((x) => x.key === e.target.value)!;
                setFrom(m);
                posthog.capture("calculator_from_changed", { model: m.key });
              }}
            >
              {FRONTIER.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} · ${m.price}/Mtok
                </option>
              ))}
            </select>
          </div>

          <div className="calc-field">
            <span className="calc-label">Switch to (open-source)</span>
            <select
              className="calc-select"
              value={to.key}
              onChange={(e) => {
                const m = OPEN.find((x) => x.key === e.target.value)!;
                setTo(m);
                posthog.capture("calculator_to_changed", { model: m.key });
              }}
            >
              {OPEN.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} · ${m.price}/Mtok
                </option>
              ))}
            </select>
          </div>

          <div className="calc-field">
            <div className="calc-label-row">
              <span className="calc-label">Monthly tokens</span>
              <span className="calc-val">{tokens(tok)}</span>
            </div>
            <input
              className="calc-range"
              type="range"
              min={1}
              max={5000}
              step={1}
              value={tok}
              onChange={(e) => setTok(Number(e.target.value))}
            />
          </div>
        </div>

        {/* ── output: closed vs open ── */}
        <div className="calc-out">
          <div className="calc-out-row">
            <span className="calc-out-k">on {from.label}</span>
            <span className="calc-out-v strike">{money(r.fromCost)}</span>
          </div>
          <div className="calc-out-row">
            <span className="calc-out-k">on bitrouter · {to.label}</span>
            <span className="calc-out-v">{money(r.toCost)}</span>
          </div>
          <div className="calc-out-sub">
            <span>
              <span className="calc-dim">list</span> ${from.price} → ${to.price}{" "}
              / Mtok
            </span>
          </div>

          <div className="calc-hero">
            <span className="calc-hero-k">you save / mo</span>
            <span className="calc-hero-num">{money(r.save)}</span>
            <span className="calc-hero-pct">−{r.pct}%</span>
          </div>

          <a
            href="https://cloud.bitrouter.ai"
            className="calc-cta"
            onClick={() => posthog.capture("calculator_start_cta_clicked")}
          >
            → start free · one API key, every model
          </a>
        </div>
      </div>

      <div className="calc-foot">
        Illustrative, at official list prices. BitRouter routes each call to the
        cheapest model that holds quality — 0% markup on every token.
      </div>
    </div>
  );
}
