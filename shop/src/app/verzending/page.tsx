"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function ShippingPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="bg-black min-h-screen">
      <section className="pt-20 pb-12 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-6xl md:text-8xl text-white leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            {t.shipping.title}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Shipping */}
          <div>
            <h2 className="text-xs tracking-[0.25em] font-bold text-white/40 mb-8 uppercase">
              {t.shipping.shipping_title}
            </h2>
            <div className="space-y-4">
              {[t.shipping.shipping_be, t.shipping.shipping_nl, t.shipping.delivery_time].map((line) => (
                <p key={line} className="text-white/70 text-sm leading-relaxed border-b border-[#1a1a1a] pb-4">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="text-xs tracking-[0.25em] font-bold text-white/40 mb-8 uppercase">
              {t.shipping.returns_title}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-10">{t.shipping.returns_text}</p>

            <h3 className="text-xs tracking-[0.2em] font-bold text-white mb-6 uppercase">
              {t.shipping.returns_steps}
            </h3>
            <ol className="space-y-4">
              {[t.shipping.step1, t.shipping.step2, t.shipping.step3, t.shipping.step4].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span
                    className="flex-shrink-0 text-3xl text-white/20 leading-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-white/60 text-sm leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
