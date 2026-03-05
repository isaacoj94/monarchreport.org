export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monarchreport.org";
export const SITE_NAME = "Monarch Report";
export const SITE_TAGLINE = "Korea's Real Story in English";

export const SOCIAL_LINKS = {
  x: "https://x.com/monarchreport25",
  facebook: "https://facebook.com/p/The-Monarch-Report-61581485848456",
  instagram: "https://instagram.com/monarchreport25",
} as const;

// Curated tweet IDs for the feed (manually updated for MVP)
// Real @monarchreport25 tweet IDs
export const CURATED_TWEET_IDS = [
  "2017539063805337860",
  "1986603327648342474",
  "1986470890025197632",
  "1985653628355444824",
  "1984255273884684375",
  "1982161053384413581",
  "1979247459596419327",
  "1978265307387929077",
  "1977228437300691028",
];

export const NEWS_CATEGORIES = [
  "all",
  "politics",
  "economy",
  "foreign-policy",
  "defense",
  "technology",
  "opinion",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const BILL_STATUSES = [
  "all",
  "proposed",
  "committee",
  "plenary",
  "passed",
  "rejected",
] as const;

export type BillStatusFilter = (typeof BILL_STATUSES)[number];
