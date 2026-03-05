import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsList } from "@/components/features/news/NewsList";
import { fetchAllFeeds } from "@/lib/news/rss";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

// Revalidate this page every 15 minutes
export const revalidate = 900;

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  let articles: Awaited<ReturnType<typeof fetchAllFeeds>> = [];
  try {
    articles = await fetchAllFeeds();
  } catch (error) {
    console.error("[News] Failed to fetch feeds:", error);
    articles = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-monarch-orange/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-monarch-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">
            {t("page_title")}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl">
          {t("page_subtitle")}
        </p>
      </div>

      {/* Source Trust Banner */}
      <div className="mb-8 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>
            All articles link to verified sources: Reuters, AP, BBC, Fox News, Wall Street Journal, CNBC, Defense One
          </span>
        </div>
      </div>

      {articles.length > 0 ? (
        <NewsList articles={articles} />
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📰</div>
          <h2 className="text-xl font-semibold mb-2">Loading News Feeds...</h2>
          <p className="text-muted-foreground">
            RSS feeds are being fetched. Please refresh in a moment.
          </p>
        </div>
      )}
    </div>
  );
}
