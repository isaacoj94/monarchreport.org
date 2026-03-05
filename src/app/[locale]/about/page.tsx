import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SOCIAL_LINKS } from "@/lib/utils/constants";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    {
      icon: "🔍",
      title: t("value_truth"),
      desc: t("value_truth_desc"),
    },
    {
      icon: "✝️",
      title: t("value_freedom"),
      desc: t("value_freedom_desc"),
    },
    {
      icon: "🛡️",
      title: t("value_watchdog"),
      desc: t("value_watchdog_desc"),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Hero */}
      <ScrollReveal>
        <div className="text-center mb-16">
          <div className="mx-auto mb-6 w-16 h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full text-monarch-orange">
              <path d="M50 50 C30 20, 5 25, 15 55 C20 70, 35 75, 50 50Z" fill="currentColor" opacity="0.9" />
              <path d="M50 50 C70 20, 95 25, 85 55 C80 70, 65 75, 50 50Z" fill="currentColor" opacity="0.9" />
              <path d="M50 50 C35 60, 20 85, 40 80 C48 78, 50 65, 50 50Z" fill="currentColor" opacity="0.7" />
              <path d="M50 50 C65 60, 80 85, 60 80 C52 78, 50 65, 50 50Z" fill="currentColor" opacity="0.7" />
              <ellipse cx="50" cy="52" rx="2.5" ry="15" fill="currentColor" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">
            {t("page_title")}
          </h1>
          <p className="text-xl text-monarch-orange font-medium">
            {t("page_subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Mission */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-4">
            {t("mission_title")}
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("mission_text")}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Values */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">
            {t("values_title")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-border bg-card hover:monarch-glow transition-all duration-300"
              >
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Follow */}
      <ScrollReveal>
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">
            {t("follow_title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-monarch-orange/30 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div>
                <div className="font-semibold">X (Twitter)</div>
                <div className="text-sm text-muted-foreground">@monarchreport25</div>
              </div>
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-monarch-orange/30 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <div>
                <div className="font-semibold">Facebook</div>
                <div className="text-sm text-muted-foreground">Monarch Report</div>
              </div>
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-monarch-orange/30 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <div>
                <div className="font-semibold">Instagram</div>
                <div className="text-sm text-muted-foreground">@monarchreport25</div>
              </div>
            </a>
          </div>
        </section>
      </ScrollReveal>

      {/* Quote */}
      <ScrollReveal>
        <div className="text-center p-8 rounded-xl bg-muted/50 border border-border">
          <blockquote className="font-heading text-xl italic text-muted-foreground">
            &ldquo;Blessed are they which are persecuted for righteousness&apos; sake: for theirs is the kingdom of heaven.&rdquo;
          </blockquote>
          <cite className="block mt-3 text-sm text-muted-foreground">
            — Matthew 5:10
          </cite>
        </div>
      </ScrollReveal>
    </div>
  );
}
