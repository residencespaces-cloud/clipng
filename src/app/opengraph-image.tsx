import { ImageResponse } from "next/og";

export const alt = "KudiClip — Get Paid to Clip";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070709",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              border: "5px solid #00E878",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "14px solid transparent",
                borderBottom: "14px solid transparent",
                borderLeft: "24px solid #00E878",
                marginLeft: 6,
              }}
            />
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#00E878", letterSpacing: -1 }}>
            kudiclip
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#EFEFEC",
              lineHeight: 1.05,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            Get Paid to Clip.
          </div>
          <div style={{ fontSize: 28, color: "#7A7A8A", maxWidth: 820, lineHeight: 1.35 }}>
            Nigerian campaigns. Naira payouts. Earn per every 1,000 views.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, color: "#00E878", fontSize: 22, fontWeight: 600 }}>
          <span>Clippers</span>
          <span style={{ color: "#7A7A8A" }}>·</span>
          <span>Funders</span>
          <span style={{ color: "#7A7A8A" }}>·</span>
          <span>kudiclip.com</span>
        </div>
      </div>
    ),
    size,
  );
}
