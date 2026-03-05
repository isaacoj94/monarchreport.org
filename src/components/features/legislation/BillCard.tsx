"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { BillStatusBadge } from "./BillStatusBadge";
import type { Bill } from "@/lib/assembly/types";
import type { Locale } from "@/i18n/routing";

export function BillCard({ bill }: { bill: Bill }) {
  const t = useTranslations("legislation");
  const locale = useLocale() as Locale;

  const title = bill.title[locale] || bill.title.ko;
  const summary = bill.summary[locale] || bill.summary.ko;

  return (
    <Link
      href={`/legislation/${bill.id}`}
      className="block p-5 rounded-xl border border-border bg-card hover:border-monarch-orange/30 hover:monarch-glow transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-card-foreground group-hover:text-monarch-orange transition-colors line-clamp-2">
          {title}
        </h3>
        <BillStatusBadge status={bill.status} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{summary}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          {t("proposer")}: {bill.proposer}
        </span>
        <span>
          {t("committee")}: {bill.committee}
        </span>
        <span>
          {t("proposed_date")}: {bill.proposedDate}
        </span>
      </div>
    </Link>
  );
}
