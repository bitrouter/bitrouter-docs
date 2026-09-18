import { ImageResponse } from "next/og";

export const alt = "BitRouter — Open-Source LLM Router";
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
            Cut inference costs. Keep control.
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
            <span>Apache-2.0</span>
            <span>&#183;</span>
            <span>Self-host or Cloud</span>
            <span>&#183;</span>
            <span>Policy you own</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
