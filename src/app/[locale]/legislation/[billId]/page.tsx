import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; billId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legislation" });
  return {
    title: `Bill Detail — ${t("meta_title")}`,
  };
}

export default async function BillDetailPage({ params }: Props) {
  const { locale, billId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legislation");
  const common = await getTranslations("common");

  // In MVP, we redirect to the listing page
  // Full bill detail will be implemented with Assembly API
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/legislation"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {common("back")}
      </Link>

      <div className="p-8 rounded-xl border border-border bg-card text-center">
        <div className="text-4xl mb-4">🏛️</div>
        <h1 className="font-heading text-2xl font-bold mb-2">
          Bill #{billId}
        </h1>
        <p className="text-muted-foreground mb-6">
          Full bill details will be available once connected to the Korean National Assembly API.
        </p>
        <Link
          href="/legislation"
          className="inline-flex px-4 py-2 rounded-lg bg-monarch-orange text-white text-sm font-medium hover:bg-monarch-orange/90 transition-colors"
        >
          ← Back to All Bills
        </Link>
      </div>
    </div>
  );
}
