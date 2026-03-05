import Parser from "rss-parser";
import { NEWS_SOURCES } from "./sources";
import type { NewsArticle, NewsSource } from "./types";
import crypto from "crypto";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "MonarchReport/1.0" },
});

function generateId(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // Try various RSS image locations
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) {
    return enclosure.url;
  }
  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }
  const mediaThumbnail = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) {
    return mediaThumbnail.$.url;
  }
  return undefined;
}

async function fetchSingleFeed(source: NewsSource): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    return (feed.items ?? []).slice(0, 10).map((item) => ({
      id: generateId(item.link ?? item.guid ?? item.title ?? ""),
      title: item.title ?? "Untitled",
      description: (item.contentSnippet ?? item.content ?? "").slice(0, 300),
      url: item.link ?? "",
      source: { id: source.id, name: source.name },
      category: source.category,
      publishedAt: item.isoDate ?? new Date().toISOString(),
      imageUrl: extractImageUrl(item as Record<string, unknown>),
    }));
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${source.name}:`, error);
    return [];
  }
}

function deduplicateByUrl(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });
}

export async function fetchAllFeeds(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map((source) => fetchSingleFeed(source))
  );

  const articles = results
    .filter(
      (r): r is PromiseFulfilledResult<NewsArticle[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  const unique = deduplicateByUrl(articles);
  return unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
