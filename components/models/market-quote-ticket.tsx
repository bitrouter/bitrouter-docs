"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, ArrowRight } from "lucide-react";
import { BUYER_FEE_RATE, MARKET_AS_OF, formatMarketPrice, referenceBuyerPrice, type MarketAsset } from "@/lib/elastic-market";
import { formatQuoteUsd, previewBuyQuote, type MarketSupplier } from "@/lib/elastic-market-detail";
import { MarketInfo } from "./market-info";

export function MarketQuoteTicket({ asset, suppliers, selected, onSelect, side, onSideChange }: {
  asset: MarketAsset; suppliers: MarketSupplier[]; selected: string; onSelect: (id: string) => void;
  side: "buy" | "sell"; onSideChange: (side: "buy" | "sell") => void;
}) {
  const [input, setInput] = useState("3000");
  const [expected, setExpected] = useState("1000");
  const [maxOutput, setMaxOutput] = useState("1000");
  const [budget, setBudget] = useState("0.01");
  const [completion, setCompletion] = useState("5");
  const [validity, setValidity] = useState("IOC");
  const [purchaseBy, setPurchaseBy] = useState("2026-10-27T16:10");
  const [source, setSource] = useState(suppliers[0].id);
  const [inputRate, setInputRate] = useState(String(asset.supplierAsk.input));
  const [outputRate, setOutputRate] = useState(String(asset.supplierAsk.output));
  const [capacity, setCapacity] = useState("100");
  const [sellCompletion, setSellCompletion] = useState("5");
  const [showOffer, setShowOffer] = useState(false);

  const numberValue = (value: string) => value.trim() === "" ? NaN : Number(value);
  const request = { inputTokens: numberValue(input), estimatedOutputTokens: numberValue(expected), maxOutputTokens: numberValue(maxOutput), budgetUsd: numberValue(budget), completionMinutes: Number(completion) };
  const quote = previewBuyQuote(suppliers, request, selected);
  const hasQuote = quote.status === "ready" || quote.status === "over-budget";
  const validExpiry = validity === "IOC" || (purchaseBy.length > 0 && Date.parse(`${purchaseBy}Z`) > Date.parse(MARKET_AS_OF));
  const sellValid = inputRate.trim() !== "" && outputRate.trim() !== "" && [Number(inputRate), Number(outputRate)].every(value => Number.isFinite(value) && value >= 0) && Number.isSafeInteger(Number(capacity)) && Number(capacity) > 0;
  const offerPrice = sellValid ? referenceBuyerPrice({ input: Number(inputRate), output: Number(outputRate) }) : null;
  function previewOffer(event: FormEvent) { event.preventDefault(); setShowOffer(true); }

  return <aside className="market-terminal-panel market-ticket" aria-labelledby="quote-preview-heading" id="quote-preview" tabIndex={-1}>
    <div className="market-panel-heading"><h2 id="quote-preview-heading">Quote Preview</h2><MarketInfo title="Quote Preview">
      <p>Local design preview only. No request is sent, no order is placed, and no capacity is reserved.</p>
      <p>Buy estimates use expected output. The budget check uses the full output limit and includes the 5% fee. The final fee is based on the supplier’s actual settled charge.</p>
      <p>Purchase validity controls when an order may buy. Completion time starts after acceptance. Waiting orders need fresh quotes; the current supplier quote is not a price lock.</p>
      <p>Available capacity is quoted for the reference profile. Custom request admission must be confirmed by the supplier.</p>
    </MarketInfo></div>
    <div className="market-ticket-side" role="group" aria-label="Quote side"><button type="button" aria-pressed={side === "buy"} onClick={() => onSideChange("buy")}>Buy</button><button type="button" aria-pressed={side === "sell"} onClick={() => onSideChange("sell")}>Sell</button></div>
    {side === "buy" ? <div className="market-ticket-body">
      <label className="market-ticket-field">Supplier<select value={selected} onChange={event => onSelect(event.target.value)}><option value="best">Best eligible quote</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
      <label className="market-ticket-field">Input tokens<input type="number" min="1" step="1" value={input} onChange={event => setInput(event.target.value)} /></label>
      <div className="market-ticket-pair"><label className="market-ticket-field">Expected output<input type="number" min="0" step="1" value={expected} onChange={event => setExpected(event.target.value)} /></label><label className="market-ticket-field">Output limit<input type="number" min="1" step="1" value={maxOutput} onChange={event => setMaxOutput(event.target.value)} /></label></div>
      <label className="market-ticket-field">Total budget · USD<input type="number" min="0" step="0.001" value={budget} onChange={event => setBudget(event.target.value)} /></label>
      <div className="market-ticket-pair"><label className="market-ticket-field">Purchase validity<select value={validity} onChange={event => setValidity(event.target.value)}><option value="IOC">Immediate · IOC</option><option value="GTD">Until expiry · GTD</option></select></label><label className="market-ticket-field">Complete within<select value={completion} onChange={event => setCompletion(event.target.value)}><option value="3">3 min</option><option value="5">5 min</option><option value="10">10 min</option></select></label></div>
      {validity === "GTD" && <label className="market-ticket-field">Purchase by · UTC<input type="datetime-local" value={purchaseBy} onInput={event => setPurchaseBy(event.currentTarget.value)} onChange={event => setPurchaseBy(event.target.value)} /></label>}
      <div className="market-ticket-estimate" aria-live="polite" aria-atomic="true">
        {hasQuote ? <><div className="market-ticket-match"><span>{quote.supplier.name}</span><span>≤ {quote.supplier.completionMinutes} min</span></div><dl>
          <div><dt>Supplier estimate</dt><dd>{formatQuoteUsd(quote.supplierEstimate)}</dd></div><div><dt>Buyer fee · 5%</dt><dd>{formatQuoteUsd(quote.feeEstimate)}</dd></div>
          <div className="market-ticket-total"><dt>Estimated total</dt><dd>{formatQuoteUsd(quote.estimatedTotal)}</dd></div>
          <div><dt>Cost at output limit</dt><dd>{formatQuoteUsd(quote.ceilingTotal)}</dd></div><div><dt>Maximum authorized</dt><dd>{formatQuoteUsd(request.budgetUsd)}</dd></div>
        </dl><div className={`market-quote-result ${quote.status === "ready" && validExpiry ? "market-quote-ok" : "market-quote-warning"}`}>{!validExpiry ? "Purchase expiry must follow the demo snapshot." : quote.status === "ready" ? <><Check size={13} aria-hidden="true" />Within budget · estimate only</> : "Output-limit cost exceeds your budget."}</div></> : <p className="market-quote-warning">{quote.message}</p>}
      </div>
      <p className="market-ticket-disclosure">Preview only · no order placed</p>
      <Link href="/docs/market/buy-inference" className="market-ticket-link">Buying inference <ArrowUpRight size={13} aria-hidden="true" /></Link>
    </div> : <form className="market-ticket-body" onSubmit={previewOffer} onChange={() => setShowOffer(false)}>
      <label className="market-ticket-field">Connected source · demo<select value={source} onChange={event => setSource(event.target.value)}>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
      <div className="market-ticket-pair"><label className="market-ticket-field">Input / 1M · USD<input type="number" min="0" step="0.01" value={inputRate} onChange={event => setInputRate(event.target.value)} required /></label><label className="market-ticket-field">Output / 1M · USD<input type="number" min="0" step="0.01" value={outputRate} onChange={event => setOutputRate(event.target.value)} required /></label></div>
      <label className="market-ticket-field">Reference requests<input type="number" min="1" step="1" value={capacity} onChange={event => setCapacity(event.target.value)} required /></label>
      <label className="market-ticket-field">Complete within<select value={sellCompletion} onChange={event => setSellCompletion(event.target.value)}><option value="3">3 min</option><option value="5">5 min</option><option value="10">10 min</option></select></label>
      <div className="market-sell-profile">3K input / 1K output · No cache</div>
      <button className="market-preview-button" type="submit" disabled={!sellValid}>Preview offer <ArrowRight size={14} aria-hidden="true" /></button>
      {showOffer && sellValid && <div className="market-ticket-estimate" role="status"><div className="market-ticket-match"><span>Offer preview</span><span>Unpublished</span></div><dl><div><dt>Source</dt><dd>{suppliers.find(supplier => supplier.id === source)?.name}</dd></div><div><dt>Buyer ask / 1M</dt><dd>{formatMarketPrice(offerPrice)}</dd></div><div><dt>Supplier / request</dt><dd>{formatQuoteUsd((Number(inputRate) * 3000 + Number(outputRate) * 1000) / 1_000_000)}</dd></div><div><dt>Buyer / request</dt><dd>{formatQuoteUsd((offerPrice ?? 0) * 0.004)}</dd></div><div><dt>Capacity</dt><dd>{Number(capacity).toLocaleString("en-US")} requests</dd></div><div><dt>Completion</dt><dd>≤ {sellCompletion} min</dd></div><div><dt>Buyer fee</dt><dd>{BUYER_FEE_RATE * 100}% added</dd></div></dl></div>}
      <p className="market-ticket-disclosure">Preview only · no offer published</p><Link href="/docs/market/sell-inference" className="market-ticket-link">Selling inference <ArrowUpRight size={13} aria-hidden="true" /></Link>
    </form>}
  </aside>;
}
