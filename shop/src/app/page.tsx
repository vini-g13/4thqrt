"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const featured = products.filter((p) => p.inStock).slice(0, 3);

  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="animate-slide-up mb-10">
            <Image
              src="/4th_wit.png"
              alt="4THQRT"
              width={300}
              height={100}
              className="mx-auto h-20 md:h-28 w-auto"
              priority
            />
          </div>

          <h1
            className="font-display animate-slide-up-delay-1 text-6xl md:text-8xl lg:text-[120px] leading-none text-white mb-8"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900 }}
          >
            {t.home.tagline}
          </h1>

          <p className="animate-slide-up-delay-2 text-white/50 text-sm md:text-base tracking-[0.3em] mb-12 font-medium uppercase">
            {t.home.sub}
          </p>

          <div className="animate-slide-up-delay-3">
            <Link
              href="/shop"
              className="inline-block bg-white text-black text-xs tracking-[0.3em] font-bold px-10 py-4 border-2 border-white hover:bg-black hover:text-white transition-colors duration-200"
            >
              {t.home.cta}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 to-white/20" />
        </div>
      </section>

      {/* Story strip */}
      <section className="bg-white text-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl mb-8 leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            {t.home.story_heading}
          </h2>
          <p className="text-black/60 text-base md:text-lg leading-relaxed max-w-2xl">
            {t.home.story_text}
          </p>
          <Link
            href="/over-ons"
            className="inline-block mt-8 border-2 border-black text-black text-xs tracking-[0.25em] font-bold px-8 py-3 hover:bg-black hover:text-white transition-colors duration-200"
          >
            {locale === "nl" ? "ONS VERHAAL →" : "OUR STORY →"}
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2
              className="text-3xl md:text-5xl text-white leading-none"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
            >
              {locale === "nl" ? "NIEUW" : "NEW IN"}
            </h2>
            <Link
              href="/shop"
              className="text-white/40 text-xs tracking-[0.2em] font-bold hover:text-white transition-colors"
            >
              {locale === "nl" ? "BEKIJK ALLES →" : "VIEW ALL →"}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                addToCartLabel={t.shop.add_to_cart}
                soldOutLabel={t.shop.sold_out}
                almostGoneLabel={t.shop.almost_gone}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Full-width quote */}
      <section className="py-24 px-4 border-t border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto text-center">
          <blockquote
            className="text-5xl md:text-7xl lg:text-9xl text-white leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            &ldquo;IT&rsquo;S NOT OVER.&rdquo;
          </blockquote>
        </div>
      </section>
    </div>
  );
}
