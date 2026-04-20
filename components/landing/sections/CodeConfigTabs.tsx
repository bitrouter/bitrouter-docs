import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";

export function CodeConfigTabs({
  sectionLabel,
  caption,
  counter,
}: {
  sectionLabel: string;
  caption: string;
  counter?: string;
}) {
  return (
    <div>
      <RuledSectionLabel label={sectionLabel} counter={counter} />
      <div className="mt-6">
        <Terminal className="max-h-none max-w-none font-mono [&_pre]:overflow-visible [&_code]:overflow-visible">
          <TypingAnimation className="text-foreground" duration={40}>
            &gt; bitrouter
          </TypingAnimation>

          <AnimatedSpan className="text-muted-foreground">
            <span>no configuration found — launching setup wizard</span>
          </AnimatedSpan>

          <AnimatedSpan className="text-foreground/80">
            <span>? Choose a provider mode:</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;› Default (BitRouter Cloud)</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-muted-foreground">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;Bring Your Own Key</span>
          </AnimatedSpan>

          <AnimatedSpan className="text-foreground/80">
            <span>? Generate a new Ed25519 keypair?</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;› Yes</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>✓ master key → ~/.bitrouter/keys/master.ed25519</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-muted-foreground">
            <span>&nbsp;&nbsp;solana&nbsp;&nbsp;9a3f9fe8…9b712</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-muted-foreground">
            <span>&nbsp;&nbsp;evm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0x7c2f3e1a…8af90</span>
          </AnimatedSpan>

          <AnimatedSpan className="text-foreground/80">
            <span>? Derive an agent authority?</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;› label: my-coding-agent</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;per-tx-cap: 5_000_000 (5 USDC)</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;cumulative-cap: 50_000_000 (50 USDC)</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;expires-at: +14d</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>✓ on-chain authority signed · tx 4Pq…zH2</span>
          </AnimatedSpan>

          <AnimatedSpan className="text-emerald-500">
            <span>✓ config → ~/.bitrouter/bitrouter.yaml</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>✓ api server listening on 127.0.0.1:8787</span>
          </AnimatedSpan>
          <AnimatedSpan className="text-emerald-500">
            <span>✓ health check passed</span>
          </AnimatedSpan>

          <TypingAnimation
            className="text-muted-foreground"
            duration={30}
            delay={300}
          >
            ready.
          </TypingAnimation>
        </Terminal>
        <p className="mt-3 text-xs text-muted-foreground font-mono">
          {caption}
        </p>
      </div>
    </div>
  );
}
