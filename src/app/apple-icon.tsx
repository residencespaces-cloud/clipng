import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070709",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 999,
            border: "8px solid #00E878",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "22px solid transparent",
              borderBottom: "22px solid transparent",
              borderLeft: "36px solid #00E878",
              marginLeft: 8,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
