import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchBillById } from "@/lib/assembly/client";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; billId: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, billId } = await params;
  const bill = await fetchBillById(billId);
  const t = await getTranslations({ locale, namespace: "legislation" });

  if (!bill) {
    return { title: `${t("bill_not_found")} — ${t("meta_title")}` };
  }

  return {
    title: `${bill.title.ko} — ${t("meta_title")}`,
    description: bill.summary[(locale as Locale) || "en"],
  };
}

// Format date string like "20260215" to "2026-02-15"
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr.length < 8) return "-";
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

export default async function BillDetailPage({ params }: Props) {
  const { locale, billId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legislation");

  const bill = await fetchBillById(billId);

  if (!bill) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/legislation"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("back_to_list")}
        </Link>

        <div className="p-12 rounded-xl border border-border bg-card text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-heading text-2xl font-bold mb-2">{t("bill_not_found")}</h1>
          <p className="text-muted-foreground mb-6">{t("bill_not_found_desc")}</p>
          <Link
            href="/legislation"
            className="inline-flex px-5 py-2.5 rounded-lg bg-monarch-orange text-white text-sm font-medium hover:bg-monarch-orange/90 transition-colors"
          >
            {t("back_to_list")}
          </Link>
        </div>
      </div>
    );
  }

  const title = bill.title[(locale as Locale)] || bill.title.ko;
  const summary = bill.summary[(locale as Locale)] || bill.summary.ko;

  // Determine status steps for the timeline
  const statusOrder = ["proposed", "committee", "plenary", "passed"] as const;
  const currentIndex = statusOrder.indexOf(
    bill.status === "promulgated" ? "passed" :
    bill.status === "rejected" ? "plenary" :
    bill.status === "withdrawn" ? "committee" :
    bill.status as typeof statusOrder[number]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <Link
        href="/legislation"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t("back_to_list")}
      </Link>

      {/* Bill Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`status-${bill.status} inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold`}>
            {t(`status_${bill.status}`)}
          </span>
          <span className="text-sm text-muted-foreground font-mono">
            #{bill.billNumber}
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          {title}
        </h1>
        {locale !== "ko" && title !== bill.title.ko && (
          <p className="text-lg text-muted-foreground">{bill.title.ko}</p>
        )}
        <p className="text-muted-foreground mt-3">{summary}</p>
      </div>

      {/* Bill Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">{t("bill_proposer")}</div>
          <div className="font-medium">{bill.proposer}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">{t("bill_committee")}</div>
          <div className="font-medium">{bill.committee}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">{t("bill_proposed_date")}</div>
          <div className="font-medium">{formatDate(bill.proposedDate)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">{t("bill_last_action")}</div>
          <div className="font-medium">{bill.lastAction}</div>
        </div>
      </div>

      {/* Legislative Timeline */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold mb-4">{t("bill_timeline")}</h2>
        <div className="relative">
          <div className="flex items-center justify-between">
            {statusOrder.map((step, i) => {
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const isRejected = bill.status === "rejected" && i === currentIndex;
              const isWithdrawn = bill.status === "withdrawn" && i === currentIndex;

              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                        isActive ? "bg-monarch-orange" : "bg-border"
                      }`}
                    />
                  )}
                  {/* Step dot */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isRejected
                        ? "bg-red-500 text-white"
                        : isWithdrawn
                        ? "bg-yellow-500 text-white"
                        : isCurrent
                        ? "bg-monarch-orange text-white ring-4 ring-monarch-orange/20"
                        : isActive
                        ? "bg-monarch-orange text-white"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isRejected ? "✕" : isWithdrawn ? "↩" : isActive ? "✓" : i + 1}
                  </div>
                  {/* Step label */}
                  <span
                    className={`text-xs mt-2 text-center ${
                      isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(`status_${step}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voting Record */}
      {bill.votingRecord && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-bold mb-4">{t("bill_voting")}</h2>
          <div className="p-6 rounded-xl border border-border bg-card">
            {/* Vote bar */}
            <div className="mb-4">
              <div className="flex rounded-full overflow-hidden h-4">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(bill.votingRecord.yesVotes / bill.votingRecord.totalVotes) * 100}%` }}
                  title={`${t("yes_votes")}: ${bill.votingRecord.yesVotes}`}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(bill.votingRecord.noVotes / bill.votingRecord.totalVotes) * 100}%` }}
                  title={`${t("no_votes")}: ${bill.votingRecord.noVotes}`}
                />
                <div
                  className="bg-gray-400 transition-all"
                  style={{ width: `${(bill.votingRecord.abstentions / bill.votingRecord.totalVotes) * 100}%` }}
                  title={`${t("abstentions")}: ${bill.votingRecord.abstentions}`}
                />
              </div>
            </div>

            {/* Vote counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">{bill.votingRecord.yesVotes}</div>
                <div className="text-xs text-muted-foreground">{t("yes_votes")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{bill.votingRecord.noVotes}</div>
                <div className="text-xs text-muted-foreground">{t("no_votes")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{bill.votingRecord.abstentions}</div>
                <div className="text-xs text-muted-foreground">{t("abstentions")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{bill.votingRecord.absent}</div>
                <div className="text-xs text-muted-foreground">{t("absent")}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
              {t("bill_proposed_date")}: {formatDate(bill.votingRecord.date)}
            </div>
          </div>
        </div>
      )}

      {/* Source Link */}
      {bill.sourceUrl && (
        <div className="p-4 rounded-xl border border-border bg-muted/50">
          <a
            href={bill.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-monarch-orange hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t("bill_detail_link")}
          </a>
        </div>
      )}
    </div>
  );
}
