import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup"],
        disallow: ["/api/", "/admin", "/clipper", "/funder", "/uploads/", "/login", "/forgot-password", "/reset-password", "/verify-email"],
      },
    ],
    sitemap: "https://kudiclip.com/sitemap.xml",
    host: "https://kudiclip.com",
  };
}
