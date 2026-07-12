"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/translations";

interface Props {
  product: Product;
  locale: Locale;
  addToCartLabel: string;
  soldOutLabel: string;
  almostGoneLabel: string;
}

export default function ProductCard({ product, locale, addToCartLabel, soldOutLabel, almostGoneLabel }: Props) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block bg-[#0a0a0a] border border-[#1a1a1a] hover:border-white/20 transition-colors">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
        <Image
          src={product.images[0]}
          alt={product.name[locale]}
          fill
          className="object-cover grayscale transition-transform duration-300 group-hover:scale-105" /* Verwijder de grayscale class als je kleurenfoto's wil gebruiken */
          sizes="(max-width: 768px) 50vw, 33vw"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white text-xs tracking-[0.2em] font-bold border border-white px-4 py-2">
              {soldOutLabel}
            </span>
          </div>
        )}
        {product.inStock && product.lowStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-white text-black text-[0.65rem] tracking-[0.18em] font-bold px-3 py-1 uppercase">
              {almostGoneLabel}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white text-xs tracking-[0.15em] font-bold mb-2 leading-snug">
          {product.name[locale]}
        </h3>
        <p className="text-white/60 text-sm font-bold">€{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
