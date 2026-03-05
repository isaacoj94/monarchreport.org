import { getTranslations, setRequestLocale } from "next-intl/server";
import { TweetGrid } from "@/components/features/feed/TweetGrid";
import { CURATED_TWEET_IDS } from "@/lib/utils/constants";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function FeedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feed");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          {t("page_title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("page_subtitle")}
        </p>
      </div>

      {/* Follow CTA */}
      <div className="mb-8 p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-monarch-orange" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="font-semibold">@monarchreport25</span>
        </div>
        <a
          href="https://x.com/monarchreport25"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-monarch-orange text-white text-sm font-medium hover:bg-monarch-orange/90 transition-colors"
        >
          Follow on X →
        </a>
      </div>

      {/* Tweet Grid */}
      <TweetGrid tweetIds={CURATED_TWEET_IDS} />
    </div>
  );
}
