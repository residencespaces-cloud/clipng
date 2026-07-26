import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KudiClip",
    short_name: "KudiClip",
    description:
      "Nigerian campaigns. Naira payouts. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.",
    start_url: "/",
    display: "standalone",
    background_color: "#070709",
    theme_color: "#00E878",
    orientation: "portrait-primary",
    categories: ["business", "entertainment", "social"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
