import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://kudiclip.com/",
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://kudiclip.com/signup",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
