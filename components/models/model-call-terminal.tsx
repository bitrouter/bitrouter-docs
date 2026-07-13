"use client";

/* Client island for the model page's animated `bitrouter chat` terminal —
   the Terminal takes a program *function*, which can't cross the server→client
   boundary, so it's built here from plain string props. */

import * as React from "react";
import { Terminal, Ok, Dim, Faint } from "../landing/mono/terminal";

export function ModelCallTerminal({
  id,
  provider,
  fin,
  fout,
}: {
  id: string;
  provider: string;
  fin: string;
  fout: string;
}) {
  const program = React.useCallback(
    () => [
      ["type", `bitrouter chat --model ${id}`, { prefix: "$", cps: 60, after: 360 }],
      [
        "print",
        <span>
          <Dim>POST</Dim> api.bitrouter.ai/v1/chat <Faint>· 1 key</Faint>
        </span>,
        220,
      ],
      [
        "spin",
        `routing → ${provider}`,
        950,
        <span>
          <Ok>✓</Ok> <span className="lbl">{id}</span>{" "}
          <Faint>
            · {fin} / {fout}
          </Faint>
        </span>,
      ],
      [
        "print",
        <span>
          <Dim>stream</Dim> <span className="caret accent" />
        </span>,
        600,
      ],
      ["loop", 1800],
    ],
    [id, provider, fin, fout],
  );

  return (
    <Terminal
      title={`call · ${id}`}
      accentPrompt={false}
      className="mp-term"
      program={program as never}
    />
  );
}
