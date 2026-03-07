import { ImageResponse } from "next/og";

export const alt = "BitRouter — Open Intelligence Router for LLM Agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily: "monospace",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            BitRouter
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Open Intelligence Router for LLM Agents
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "32px",
              fontSize: 20,
              color: "#71717a",
            }}
          >
            <span>200+ Models</span>
            <span>&#183;</span>
            <span>93.2% SWE-bench</span>
            <span>&#183;</span>
            <span>&lt;10ms Overhead</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
