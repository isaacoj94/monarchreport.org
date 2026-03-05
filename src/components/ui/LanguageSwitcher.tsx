"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import type { Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "한국어",
  ja: "日本語",
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  ko: "🇰🇷",
  ja: "🇯🇵",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-border transition-colors text-sm font-medium"
        aria-label="Switch language"
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span>{LOCALE_LABELS[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]">
          {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                loc === locale ? "text-monarch-orange font-medium" : ""
              }`}
            >
              <span>{LOCALE_FLAGS[loc]}</span>
              <span>{LOCALE_LABELS[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
