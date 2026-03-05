import type { NewsSource } from "./types";

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "bbc-world",
    name: "BBC World",
    rssUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "foreign-policy",
    reliability: "high",
  },
  {
    id: "bbc-asia",
    name: "BBC Asia",
    rssUrl: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
    category: "foreign-policy",
    reliability: "high",
  },
  {
    id: "foxnews-politics",
    name: "Fox News - Politics",
    rssUrl: "https://moxie.foxnews.com/google-publisher/politics.xml",
    category: "politics",
    reliability: "medium",
  },
  {
    id: "foxnews-world",
    name: "Fox News - World",
    rssUrl: "https://moxie.foxnews.com/google-publisher/world.xml",
    category: "foreign-policy",
    reliability: "medium",
  },
  {
    id: "wsj-world",
    name: "Wall Street Journal",
    rssUrl: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    category: "foreign-policy",
    reliability: "high",
  },
  {
    id: "cnbc-economy",
    name: "CNBC",
    rssUrl: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    category: "economy",
    reliability: "high",
  },
  {
    id: "npr-news",
    name: "NPR News",
    rssUrl: "https://feeds.npr.org/1001/rss.xml",
    category: "politics",
    reliability: "high",
  },
  {
    id: "hill-news",
    name: "The Hill",
    rssUrl: "https://thehill.com/feed/",
    category: "politics",
    reliability: "high",
  },
];
