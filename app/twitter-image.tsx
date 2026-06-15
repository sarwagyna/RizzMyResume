import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          {SITE.name}
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 900,
            color: "#cbd5e1",
          }}
        >
          {SITE.description}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          Preview free · Pay ₹50 once · ATS-optimised PDF
        </div>
      </div>
    ),
    { ...size }
  );
}
