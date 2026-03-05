"use client";

import { useTranslations } from "next-intl";

export function FeedSortToggle({
  active,
  onChange,
}: {
  active: "engagement" | "recent";
  onChange: (sort: "engagement" | "recent") => void;
}) {
  const t = useTranslations("feed");

  return (
    <div className="inline-flex rounded-xl bg-muted p-1 gap-1">
      <button
        onClick={() => onChange("engagement")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active === "engagement"
            ? "bg-monarch-orange text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🔥 {t("sort_engagement")}
      </button>
      <button
        onClick={() => onChange("recent")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active === "recent"
            ? "bg-monarch-orange text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🕐 {t("sort_recent")}
      </button>
    </div>
  );
}
