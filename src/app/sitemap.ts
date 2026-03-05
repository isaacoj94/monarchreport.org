import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monarchreport.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "ko", "ja"];
  const pages = ["", "/feed", "/legislation", "/news", "/about"];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${SITE_URL}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
