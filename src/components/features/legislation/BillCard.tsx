"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { BillStatusBadge } from "./BillStatusBadge";
import { RiskBadge } from "./RiskBadge";
import type { Bill } from "@/lib/assembly/types";
import type { Locale } from "@/i18n/routing";

export function BillCard({ bill }: { bill: Bill }) {
  const t = useTranslations("legislation");
  const locale = useLocale() as Locale;

  const title = bill.title[locale] || bill.title.ko;
  const summary = bill.summary[locale] || bill.summary.ko;
  const riskReason = bill.riskReason?.[locale] || bill.riskReason?.en;

  // Show Korean title as subtitle when viewing in English/Japanese
  const showKoreanSubtitle = locale !== "ko" && bill.title.en !== bill.title.ko;

  return (
    <Link
      href={`/legislation/${bill.id}`}
      className={`block p-5 rounded-xl border bg-card hover:monarch-glow transition-all duration-300 group ${
        bill.riskLevel === "critical"
          ? "border-red-500/30 hover:border-red-500/50"
          : bill.riskLevel === "high"
          ? "border-orange-500/30 hover:border-orange-500/50"
          : "border-border hover:border-monarch-orange/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground group-hover:text-monarch-orange transition-colors line-clamp-2">
            {title}
          </h3>
          {showKoreanSubtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{bill.title.ko}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {bill.riskLevel && bill.riskLevel !== "neutral" && (
            <RiskBadge level={bill.riskLevel} />
          )}
          <BillStatusBadge status={bill.status} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{summary}</p>

      {/* Risk reason for concerning bills */}
      {riskReason && bill.riskLevel && ["critical", "high"].includes(bill.riskLevel) && (
        <div className={`text-xs px-3 py-1.5 rounded-lg mb-3 ${
          bill.riskLevel === "critical" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
        }`}>
          {bill.riskLevel === "critical" ? "🚨" : "⚠️"} {riskReason}
        </div>
      )}

      {/* Affected rights tags */}
      {bill.affectedRights && bill.affectedRights.length > 0 && !bill.affectedRights.includes("none") && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bill.affectedRights.map((right) => (
            <span key={right} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {right.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          {t("proposer")}: {bill.proposer}
        </span>
        <span className="hidden sm:inline">
          {t("committee")}: {bill.committee}
        </span>
        <span>
          {t("proposed_date")}: {bill.proposedDate}
        </span>
      </div>
    </Link>
  );
}
