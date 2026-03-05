import { useTranslations } from "next-intl";
import type { BillStatus } from "@/lib/assembly/types";

const STATUS_STYLES: Record<BillStatus, string> = {
  proposed: "status-proposed",
  committee: "status-committee",
  plenary: "status-plenary",
  passed: "status-passed",
  rejected: "status-rejected",
  withdrawn: "status-withdrawn",
  promulgated: "status-promulgated",
};

export function BillStatusBadge({ status }: { status: BillStatus }) {
  const t = useTranslations("legislation");

  const statusKey = `status_${status}` as const;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {t(statusKey)}
    </span>
  );
}
