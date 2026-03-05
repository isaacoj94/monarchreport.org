"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BillCard } from "./BillCard";
import type { Bill } from "@/lib/assembly/types";
import { BILL_STATUSES, type BillStatusFilter } from "@/lib/utils/constants";

export function BillList({ bills }: { bills: Bill[] }) {
  const t = useTranslations("legislation");
  const [filter, setFilter] = useState<BillStatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      const matchesFilter = filter === "all" || bill.status === filter;
      const matchesSearch =
        !search ||
        bill.title.ko.toLowerCase().includes(search.toLowerCase()) ||
        bill.title.en.toLowerCase().includes(search.toLowerCase()) ||
        bill.proposer.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [bills, filter, search]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_placeholder")}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-monarch-orange/50"
        />
        <div className="flex flex-wrap gap-1.5">
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
