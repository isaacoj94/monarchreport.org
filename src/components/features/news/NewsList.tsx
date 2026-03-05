"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { NewsCard } from "./NewsCard";
import type { NewsArticle } from "@/lib/news/types";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/utils/constants";

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  const t = useTranslations("news");
  const [category, setCategory] = useState<NewsCategory>("all");

  const filtered = useMemo(() => {
    if (category === "all") return articles;
    return articles.filter((a) => a.category === category);
  }, [articles, category]);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {NEWS_CATEGORIES.map((cat) => {
          const key = cat === "all" ? "category_all" : `category_${cat.replace("-", "_")}`;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? "bg-monarch-orange text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(key)}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length > 0 ? (
          filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No articles found
          </div>
        )}
      </div>
    </div>
  );
}
