"use client";

import { useTranslations } from "next-intl";
import type { NewsArticle } from "@/lib/news/types";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NewsCard({ article }: { article: NewsArticle }) {
  const t = useTranslations("news");

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-5 rounded-xl border border-border bg-card hover:border-monarch-orange/30 hover:monarch-glow transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-monarch-orange/10 text-monarch-orange">
              {article.source.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <h3 className="font-semibold text-card-foreground group-hover:text-monarch-orange transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.description}
          </p>
          <div className="mt-3 flex items-center text-xs text-monarch-orange font-medium">
            {t("read_full")}
            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Thumbnail */}
        {article.imageUrl && (
          <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </a>
  );
}
