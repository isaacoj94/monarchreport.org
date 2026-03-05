import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/news/rss";

// Cache the result in memory for 15 minutes
let cache: { data: Awaited<ReturnType<typeof fetchAllFeeds>>; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;

    // Simple in-memory cache
    const now = Date.now();
    if (!cache || now - cache.timestamp > CACHE_TTL) {
      cache = {
        data: await fetchAllFeeds(),
        timestamp: now,
      };
    }

    let articles = cache.data;

    if (category && category !== "all") {
      articles = articles.filter((a) => a.category === category);
    }

    const paginated = articles.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      articles: paginated,
      total: articles.length,
      page,
      hasMore: page * limit < articles.length,
    });
  } catch (error) {
    console.error("[News API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
