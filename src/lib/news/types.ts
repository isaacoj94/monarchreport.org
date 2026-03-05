export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: {
    id: string;
    name: string;
  };
  category: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  category: string;
  reliability: "high" | "medium";
}
