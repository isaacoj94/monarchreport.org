"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { useEffect, useState } from "react";

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/feed", label: t("feed") },
    { href: "/legislation", label: t("legislation") },
    { href: "/news", label: t("news") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Monarch Butterfly SVG */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              className="text-monarch-orange group-hover:scale-110 transition-transform"
            >
              {/* Left wing */}
              <path
                d="M50 50 C30 20, 5 25, 15 55 C20 70, 35 75, 50 50Z"
                fill="currentColor"
                opacity="0.9"
              />
              {/* Right wing */}
              <path
                d="M50 50 C70 20, 95 25, 85 55 C80 70, 65 75, 50 50Z"
                fill="currentColor"
                opacity="0.9"
              />
              {/* Lower left wing */}
              <path
                d="M50 50 C35 60, 20 85, 40 80 C48 78, 50 65, 50 50Z"
                fill="currentColor"
                opacity="0.7"
              />
              {/* Lower right wing */}
              <path
                d="M50 50 C65 60, 80 85, 60 80 C52 78, 50 65, 50 50Z"
                fill="currentColor"
                opacity="0.7"
              />
              {/* Body */}
              <ellipse cx="50" cy="52" rx="2.5" ry="15" fill="currentColor" />
              {/* Antennae */}
              <path
                d="M48 38 C45 28, 38 22, 35 20"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M52 38 C55 28, 62 22, 65 20"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="35" cy="19" r="1.5" fill="currentColor" />
              <circle cx="65" cy="19" r="1.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold leading-tight tracking-tight">
                Monarch
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-tight">
                Report
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted link-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <MobileNav items={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
