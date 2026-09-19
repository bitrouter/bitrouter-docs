"use client";

import type { WTerm as WTermInstance } from "@wterm/dom";
import { Terminal as WTerm } from "@wterm/react";
import "@wterm/react/css";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type DemoTerminalProps = {
  output: string;
  cols: number;
  rows: number;
  label: string;
  background?: string;
  className?: string;
  style?: CSSProperties;
};

/** A read-only ANSI terminal. The caller owns timing by updating `output`. */
export function DemoTerminal({
  output,
  cols,
  rows,
  label,
  background = "#0d0d0d",
  className,
  style,
}: DemoTerminalProps) {
  const terminalRef = useRef<WTermInstance | null>(null);
  const outputRef = useRef(output);
  outputRef.current = output;

  useEffect(() => {
    terminalRef.current?.write(output);
  }, [output]);

  return (
    <WTerm
      cols={cols}
      rows={rows}
      onReady={(terminal) => {
        terminalRef.current = terminal;
        terminal.write(outputRef.current);
      }}
      onData={() => {}}
      onError={(error) => console.error("Unable to initialize the demo terminal", error)}
      aria-label={label}
      aria-readonly="true"
      tabIndex={-1}
      className={["zed-wterm", className].filter(Boolean).join(" ")}
      style={{ "--term-bg": background, ...style } as CSSProperties}
    />
  );
}

type TerminalWindowProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Native macOS terminal chrome shared by the hero and feature demos. */
export function TerminalWindow({ title, children, actions, className }: TerminalWindowProps) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 34px 80px -34px rgba(0,0,0,0.85)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 38,
          padding: "0 13px",
          background: "#333336",
          borderBottom: "1px solid #262628",
        }}
      >
        <span aria-hidden="true" style={{ width: 12, height: 12, flex: "0 0 auto", borderRadius: "50%", background: "#ff5f57" }} />
        <span aria-hidden="true" style={{ width: 12, height: 12, flex: "0 0 auto", borderRadius: "50%", background: "#febc2e" }} />
        <span aria-hidden="true" style={{ width: 12, height: 12, flex: "0 0 auto", borderRadius: "50%", background: "#28c840" }} />
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 13,
            height: 11,
            borderRadius: 2,
            background: "var(--muted-foreground)",
            marginLeft: 14,
            flex: "0 0 auto",
          }}
        />
        <span
          style={{
            minWidth: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#d8d8d8",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </span>
        {actions ? <div style={{ marginLeft: "auto", flexShrink: 0 }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
