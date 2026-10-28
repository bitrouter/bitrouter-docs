import { ImageResponse } from "next/og";

export const alt = "BitRouter — The Open Market for Elastic Inference";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", backgroundColor:"#ffffff", color:"#171717", padding:"80px" }}>
      <div style={{ fontSize:26, marginBottom:60 }}>bitrouter.</div>
      <div style={{ fontSize:76, letterSpacing:"-3px" }}>The Open Market</div>
      <div style={{ fontSize:64, fontStyle:"italic", letterSpacing:"-2px", marginTop:8 }}>for Elastic Inference</div>
      <div style={{ display:"flex", gap:24, fontSize:21, color:"#737373", marginTop:60 }}><span>Your agents.</span><span>Your models.</span><span>Your infrastructure.</span></div>
    </div>,
    size,
  );
}
