"use client";

import { useTranslations } from "next-intl";

type RiskLevel = "critical" | "high" | "moderate" | "low" | "neutral";

const RISK_STYLES: Record<RiskLevel, string> = {
  critical: "bg-red-500/15 text-red-500 border-red-500/30",
  high: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  moderate: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  neutral: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const RISK_ICONS: Record<RiskLevel, string> = {
  critical: "\uD83D\uDEA8",
  high: "\u26A0\uFE0F",
  moderate: "\uD83D\uDD36",
  low: "\uD83D\uDD35",
  neutral: "\u26AA",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const t = useTranslations("legislation");

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${RISK_STYLES[level]}`}
      title={t(`risk_${level}`)}
    >
      <span className="text-xs">{RISK_ICONS[level]}</span>
      {t(`risk_${level}`)}
    </span>
  );
}
