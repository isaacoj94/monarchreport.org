import { getTranslations, setRequestLocale } from "next-intl/server";
import { BillList } from "@/components/features/legislation/BillList";
import { fetchBillsWithVotes } from "@/lib/assembly/client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legislation" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function LegislationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legislation");

  // Fetch live data from Korean National Assembly API
  const { bills, totalCount } = await fetchBillsWithVotes({
    age: 22,
    page: 1,
    size: 100,
  });

  // Calculate stats from real data
  const stats = {
    total: totalCount,
    committee: bills.filter((b) => b.status === "committee").length,
    passed: bills.filter((b) => b.status === "passed").length,
    rejected: bills.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-watchdog-red/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-watchdog-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("stat_total"), value: stats.total.toLocaleString(), icon: "\uD83D\uDCCB" },
          { label: t("stat_committee"), value: stats.committee.toString(), icon: "\uD83D\uDD0D" },
          { label: t("stat_passed"), value: stats.passed.toString(), icon: "\u2705" },
          { label: t("stat_rejected"), value: stats.rejected.toString(), icon: "\u274C" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border border-border bg-card text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-monarch-orange">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live data indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        {t("live_data_indicator")} &middot; {t("assembly_age")}
      </div>

      <BillList bills={bills} />
    </div>
  );
}
