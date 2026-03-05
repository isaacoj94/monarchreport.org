"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BillCard } from "./BillCard";
import type { Bill } from "@/lib/assembly/types";
import { BILL_STATUSES, type BillStatusFilter } from "@/lib/utils/constants";

type RiskFilter = "all" | "flagged";

export function BillList({ bills }: { bills: Bill[] }) {
  const t = useTranslations("legislation");
  const [filter, setFilter] = useState<BillStatusFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [search, setSearch] = useState("");

  const flaggedCount = useMemo(
    () => bills.filter((b) => b.riskLevel && ["critical", "high", "moderate"].includes(b.riskLevel)).length,
    [bills]
  );

  const filtered = useMemo(() => {
    return bills
      .filter((bill) => {
        const matchesFilter = filter === "all" || bill.status === filter;
        const matchesRisk =
          riskFilter === "all" ||
          (bill.riskLevel && ["critical", "high", "moderate"].includes(bill.riskLevel));
        const matchesSearch =
          !search ||
          bill.title.ko.toLowerCase().includes(search.toLowerCase()) ||
          bill.title.en.toLowerCase().includes(search.toLowerCase()) ||
          bill.proposer.toLowerCase().includes(search.toLowerCase()) ||
          bill.billNumber.includes(search);
        return matchesFilter && matchesRisk && matchesSearch;
      })
      // Sort: critical/high risk first, then by date
      .sort((a, b) => {
        if (riskFilter === "flagged" || riskFilter === "all") {
          const riskOrder = { critical: 0, high: 1, moderate: 2, low: 3, neutral: 4 };
          const aRisk = riskOrder[a.riskLevel || "neutral"];
          const bRisk = riskOrder[b.riskLevel || "neutral"];
          if (aRisk !== bRisk) return aRisk - bRisk;
        }
        return 0; // Preserve API order otherwise
      });
  }, [bills, filter, riskFilter, search]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-monarch-orange/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Risk toggle */}
          {flaggedCount > 0 && (
            <>
              <button
                onClick={() => setRiskFilter(riskFilter === "flagged" ? "all" : "flagged")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  riskFilter === "flagged"
                    ? "bg-red-500 text-white"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                }`}
              >
                <span>🚨</span>
                {riskFilter === "flagged" ? t("risk_showing_flagged") : t("risk_show_flagged")}
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                  {flaggedCount}
                </span>
              </button>
              <div className="w-px h-5 bg-border" />
            </>
          )}

          {/* Status filters */}
          {BILL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === status
                  ? "bg-monarch-orange text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`filter_${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Bill List */}
      <div className="grid gap-4">
        {filtered.length > 0 ? (
          filtered.map((bill) => <BillCard key={bill.id} bill={bill} />)
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t("no_results")}
          </div>
        )}
      </div>
    </div>
  );
}
