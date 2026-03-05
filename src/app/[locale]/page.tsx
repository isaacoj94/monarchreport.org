import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ButterflyParticles } from "@/components/animations/ButterflyParticles";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TweetCard } from "@/components/features/feed/TweetCard";
import { NewsletterForm } from "@/components/features/newsletter/NewsletterForm";
import { CURATED_TWEET_IDS } from "@/lib/utils/constants";
import { fetchBills } from "@/lib/assembly/client";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
    openGraph: {
      title: t("meta_title"),
      description: t("meta_description"),
      siteName: "Monarch Report",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@monarchreport25",
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  // Fetch latest bills for the legislative watch preview
  let recentBills: { id: string; title: string; titleKo: string; titleJa: string; status: string; date: string }[] = [];
  try {
    const { bills } = await fetchBills({ age: 22, page: 1, size: 6 });
    recentBills = bills.map((bill) => ({
      id: bill.id,
      title: bill.title.en,
      titleKo: bill.title.ko,
      titleJa: bill.title.ja,
      status: bill.status,
      date: bill.proposedDate,
    }));
  } catch {
    // Fallback to empty if API is unavailable
    recentBills = [];
  }

  return (
    <div className="relative">
      {/* === HERO SECTION === */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-monarch-orange/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-monarch-orange/5 blur-[120px]" />

        <ButterflyParticles />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Large Butterfly */}
          <div className="mx-auto mb-8 w-20 h-20 animate-float">
            <svg viewBox="0 0 100 100" className="w-full h-full text-monarch-orange">
              <path d="M50 50 C30 20, 5 25, 15 55 C20 70, 35 75, 50 50Z" fill="currentColor" opacity="0.9" />
              <path d="M50 50 C70 20, 95 25, 85 55 C80 70, 65 75, 50 50Z" fill="currentColor" opacity="0.9" />
              <path d="M50 50 C35 60, 20 85, 40 80 C48 78, 50 65, 50 50Z" fill="currentColor" opacity="0.7" />
              <path d="M50 50 C65 60, 80 85, 60 80 C52 78, 50 65, 50 50Z" fill="currentColor" opacity="0.7" />
              <ellipse cx="50" cy="52" rx="2.5" ry="15" fill="currentColor" />
              <path d="M48 38 C45 28, 38 22, 35 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M52 38 C55 28, 62 22, 65 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="35" cy="19" r="1.5" fill="currentColor" />
              <circle cx="65" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight mb-4">
            {t("hero_title")}
          </h1>
          <p className="text-xl sm:text-2xl text-monarch-orange font-medium mb-4">
            {t("hero_subtitle")}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("hero_description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/feed"
              className="px-6 py-3 rounded-xl bg-monarch-orange text-white font-semibold hover:bg-monarch-orange/90 transition-colors shadow-lg shadow-monarch-orange/20"
            >
              {t("section_feed")} →
            </Link>
            <Link
              href="/legislation"
              className="px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:border-monarch-orange/30 transition-colors"
            >
              {t("section_legislation")} →
            </Link>
          </div>
        </div>
      </section>

      {/* === TRENDING POSTS SECTION === */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold">{t("section_feed")}</h2>
              <p className="text-muted-foreground mt-1">{t("section_feed_desc")}</p>
            </div>
            <Link
              href="/feed"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-monarch-orange hover:underline"
            >
              {t("view_all")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {CURATED_TWEET_IDS.slice(0, 6).map((id) => (
              <TweetCard key={id} id={id} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/feed" className="text-sm font-medium text-monarch-orange hover:underline">
              {t("view_all")} →
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* === LEGISLATIVE WATCH SECTION === */}
      <ScrollReveal>
        <section className="bg-muted/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-3xl font-bold">{t("section_legislation")}</h2>
                <p className="text-muted-foreground mt-1">{t("section_legislation_desc")}</p>
              </div>
              <Link
                href="/legislation"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-monarch-orange hover:underline"
              >
                {t("view_all")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {recentBills.length > 0 ? (
                recentBills.slice(0, 3).map((bill) => (
                  <Link
                    key={bill.id}
                    href="/legislation"
                    className="p-5 rounded-xl border border-border bg-card hover:border-monarch-orange/30 hover:monarch-glow transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`status-${bill.status} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{bill.date}</span>
                    </div>
                    <h3 className="font-semibold group-hover:text-monarch-orange transition-colors mb-1 line-clamp-2">
                      {(locale as Locale) === "ko" ? bill.titleKo : (locale as Locale) === "ja" ? bill.titleJa : bill.title}
                    </h3>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  Loading legislative data...
                </div>
              )}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/legislation" className="text-sm font-medium text-monarch-orange hover:underline">
                {t("view_all")} →
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* === US NEWS SECTION === */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold">{t("section_news")}</h2>
              <p className="text-muted-foreground mt-1">{t("section_news_desc")}</p>
            </div>
            <Link
              href="/news"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-monarch-orange hover:underline"
            >
              {t("view_all")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder news cards - will be replaced with real RSS data */}
            {[
              { title: "US Senate Passes Key Legislation", source: "Reuters", time: "2h ago", cat: "Politics" },
              { title: "Economic Growth Exceeds Expectations", source: "CNBC", time: "4h ago", cat: "Economy" },
              { title: "New Defense Agreement Signed", source: "Defense One", time: "6h ago", cat: "Defense" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border bg-card hover:border-monarch-orange/30 hover:monarch-glow transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-monarch-orange/10 text-monarch-orange">
                    {item.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <span className="text-xs text-muted-foreground">{item.cat}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/news" className="text-sm font-medium text-monarch-orange hover:underline">
              {t("view_all")} →
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* === NEWSLETTER CTA === */}
      <ScrollReveal>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <NewsletterForm variant="banner" />
        </section>
      </ScrollReveal>
    </div>
  );
}
