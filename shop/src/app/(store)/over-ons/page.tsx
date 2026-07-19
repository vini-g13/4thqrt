"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function AboutPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="bg-black min-h-screen">
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

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <p className="text-2xl md:text-3xl text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase" }}>
            {t.about.p1}
          </p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p2}</p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p3}</p>
          {t.about.p4 ? <p className="text-white/60 text-base md:text-lg leading-relaxed">{t.about.p4}</p> : null}
        </div>
      </section>

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
    </div>
  );
}