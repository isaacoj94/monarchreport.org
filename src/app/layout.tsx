import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Monarch Report — Korea's Real Story in English",
    template: "%s | Monarch Report",
  },
  description:
    "Independent investigative journalism protecting God-given rights. Covering South Korea, East Asia, religious freedom, and human rights.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://monarchreport.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${notoSansKR.variable} ${notoSansJP.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
