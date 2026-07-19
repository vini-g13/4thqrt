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
          className="object-cover grayscale transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="border border-white px-4 py-2 text-xs font-bold tracking-[0.2em] text-white">
              {soldOutLabel}
            </span>
          </div>
        )}
        {product.inStock && product.lowStock && (
          <div className="absolute left-3 top-3">
            <span className="bg-white px-3 py-1 text-[0.65rem] font-bold tracking-[0.18em] text-black uppercase">
              {almostGoneLabel}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-xs font-bold leading-snug tracking-[0.15em] text-white">
          {product.name[locale]}
        </h3>
        <p className="text-sm font-bold text-white/60">EUR {product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}