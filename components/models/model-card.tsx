/* ModelCard — cards-view tile: facts on the left, capability radar on the
   right. The whole card links to the model's page. Pure component (no hooks). */

import * as React from "react";
import Link from "next/link";
import { ProviderIcon } from "./provider-icon";
import { CapabilityRadar } from "./capability-radar";
import {
  capabilityAxes,
  modelTier,
  formatCtx,
  modTag,
} from "@/lib/model-capability";
import { providerFromId, isOpenSourceModel } from "@/lib/models-filter";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import { type Model } from "@/lib/models-data";

export function ModelCard({ m }: { m: Model }) {
  const prov = providerFromId(m.id);
  const oss = isOpenSourceModel(m);
  const tier = modelTier(m);
  const { axes, sources } = capabilityAxes(m);
  const estimated = (Object.keys(sources) as (keyof typeof sources)[])
    .filter((k) => sources[k] === "mock")
    .length;

  return (
    <Link href={`/models/${m.id}`} className="mcard">
      <div className="mcard-facts">
        <div className="mcard-head">
          <ProviderIcon provider={prov} size={15} className="mrow-ico" />
          <span className="mcard-id">{m.id}</span>
          {oss && <span className="oss-badge">oss</span>}
        </div>
        <div className="mcard-tier">
          {tier}
          {oss ? " · open" : ""}
        </div>
        <div className="mcard-price">
          <span>
            <i>in</i>
            {formatCompactPricePerMillionTokens(m.pricing.input)}
          </span>
          <span>
            <i>out</i>
            {formatCompactPricePerMillionTokens(m.pricing.output)}
          </span>
        </div>
        <div className="mcard-meta">
          {formatCtx(m.maxInputTokens)} ctx · {m.modalities.map(modTag).join(" · ")}
        </div>
        {estimated > 0 && (
          <div className="mcard-est">~ agentic · reliability estimated</div>
        )}
      </div>
      <div className="mcard-vis">
        <CapabilityRadar
          values={axes}
          size={132}
          showLabels
          title={`${m.id} capability shape`}
        />
      </div>
    </Link>
  );
}
