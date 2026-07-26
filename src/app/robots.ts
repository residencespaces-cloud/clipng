import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup"],
        disallow: ["/api/", "/admin", "/clipper", "/funder", "/uploads/"],
      },
    ],
    sitemap: "https://kudiclip.com/sitemap.xml",
    host: "https://kudiclip.com",
  };
}
