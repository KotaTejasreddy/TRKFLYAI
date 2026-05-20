import { ImageResponse } from "next/og";

// Next.js dynamically generates this as /icon at build time.
// Browsers + Vercel pick it up as the favicon automatically.

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          borderRadius: 16,
          color: "white",
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: -2,
          boxShadow: "0 0 30px rgba(99,102,241,0.5)",
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
