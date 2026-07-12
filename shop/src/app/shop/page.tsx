"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { products, type ProductCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

type Filter = "all" | ProductCategory;

export default function ShopPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.shop.filter_all },
    { key: "tshirt", label: t.shop.filter_tshirt },
    { key: "hoodie", label: t.shop.filter_hoodie },
    { key: "accessory", label: t.shop.filter_accessories },
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-12 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1
            className="text-6xl md:text-8xl text-white leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            {t.shop.title}
          </h1>

          {/* Filters */}
          <div className="flex items-center gap-6">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs tracking-[0.2em] font-bold transition-colors pb-1 ${
                  filter === f.key
                    ? "text-white border-b border-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((product) => (
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
          {filtered.length === 0 && (
            <p className="text-white/30 text-center py-20 text-sm tracking-[0.2em]">
              {locale === "nl" ? "Geen producten gevonden." : "No products found."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
