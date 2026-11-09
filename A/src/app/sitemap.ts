import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.viziuneurbanaploiesti.ro";
  const baseUrl = rawBaseUrl.replace("://viziuneurbanaploiesti.ro", "://www.viziuneurbanaploiesti.ro").replace(/\/$/, "");
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/arhiva-lucrari`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/status`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/formular-230`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/confidentialitate`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/termeni`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
