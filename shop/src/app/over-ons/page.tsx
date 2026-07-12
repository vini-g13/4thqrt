"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function AboutPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-0 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-7xl md:text-[120px] lg:text-[160px] leading-none text-white mb-0"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontStyle: "italic",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            {t.about.title}
          </h1>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <p className="text-2xl md:text-3xl text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase" }}>
            {t.about.p1}
          </p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p2}</p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p3}</p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p4}</p>
        </div>
      </section>

      {/* Quote block */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-12">
          <div className="flex-1">
            <blockquote
              className="text-5xl md:text-7xl text-black leading-none"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontStyle: "italic",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {t.about.quote}
            </blockquote>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/4th_zwart.jpg"
              alt="4THQRT"
              width={200}
              height={67}
              className="h-16 w-auto"
            />
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
          {[
            { num: "4", label: locale === "nl" ? "Kwart van het spel" : "Quarter of the game" },
            { num: "Q4", label: locale === "nl" ? "Het moment van waarheid" : "The moment of truth" },
            { num: "∞", label: locale === "nl" ? "Mogelijkheden om terug te komen" : "Chances to come back" },
          ].map((item) => (
            <div key={item.num} className="text-center">
              <p
                className="text-5xl md:text-7xl text-white mb-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900 }}
              >
                {item.num}
              </p>
              <p className="text-white/30 text-xs tracking-[0.15em] uppercase font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
