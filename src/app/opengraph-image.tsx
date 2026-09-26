import { ImageResponse } from "next/og";

export const alt = "ATHLEX — Build your strongest self";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#060606", padding: 72, color: "#f3f3ef" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, background: "#c8ff2e", color: "#060606", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900 }}>A</div>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 4 }}>ATHLEX</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#c8ff2e", letterSpacing: 6 }}>TRAIN HARD. LIVE STRONG.</div>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.95, marginTop: 16 }}>BUILD YOUR</div>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.95, color: "#c8ff2e" }}>STRONGEST SELF.</div>
        </div>
        <div style={{ fontSize: 24, color: "#9a9aa1" }}>Premium strength & performance club · Bengaluru</div>
      </div>
    ),
    size,
  );
}
