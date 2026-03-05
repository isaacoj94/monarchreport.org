"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useState, type FormEvent } from "react";

export function NewsletterForm({ variant = "inline" }: { variant?: "inline" | "banner" }) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-monarch-orange/10 via-monarch-gold/5 to-transparent border border-monarch-orange/20 p-8 sm:p-12">
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            {t("title")}
          </h3>
          <p className="text-muted-foreground mb-6">{t("description")}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-monarch-orange/50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-xl bg-monarch-orange text-white font-semibold hover:bg-monarch-orange/90 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "..." : t("subscribe")}
            </button>
          </form>
          {status === "success" && (
            <p className="mt-3 text-sm text-green-500">{t("success")}</p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-watchdog-red">{t("error")}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">{t("privacy")}</p>
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-monarch-orange/10 rounded-full blur-3xl" />
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        required
        className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-monarch-orange/50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2 rounded-lg bg-monarch-orange text-white text-sm font-medium hover:bg-monarch-orange/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "..." : t("subscribe")}
      </button>
    </form>
  );
}
