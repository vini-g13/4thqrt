"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { getProductBySlug } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const { addItem } = useCart();
  const product = getProductBySlug(slug);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return notFound();

  function handleAddToCart() {
    if (!selectedSize || !selectedColor) return;
    addItem({
      productId: product!.id,
      slug: product!.slug,
      name: product!.name[locale],
      price: product!.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      image: product!.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link
          href="/shop"
          className="inline-block text-white/40 text-xs tracking-[0.2em] font-bold mb-10 hover:text-white transition-colors"
        >
          {t.shop.back_to_shop}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden mb-3">
              <Image
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name[locale]}
                fill
                className="object-cover grayscale" /* Verwijder de grayscale class als je kleurenfoto's wil gebruiken */
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 aspect-square overflow-hidden border transition-colors ${
                      activeImage === i ? "border-white" : "border-[#2a2a2a] hover:border-white/40"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover grayscale" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1
              className="text-3xl md:text-4xl text-white mb-4 leading-snug"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
            >
              {product.name[locale]}
            </h1>

            <p className="text-2xl text-white font-bold mb-8">
              €{product.price.toFixed(2)}
            </p>

            {/* Color */}
            <div className="mb-6">
              <p className="text-white/40 text-xs tracking-[0.2em] font-bold mb-3 uppercase">
                {t.shop.color}
                {selectedColor && <span className="text-white ml-2">— {selectedColor}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs tracking-[0.15em] font-bold border transition-colors ${
                      selectedColor === color
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-[#2a2a2a] hover:border-white/40"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <p className="text-white/40 text-xs tracking-[0.2em] font-bold mb-3 uppercase">
                {t.shop.size}
                {selectedSize && <span className="text-white ml-2">— {selectedSize}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-xs tracking-[0.1em] font-bold border transition-colors ${
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-[#2a2a2a] hover:border-white/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className={`w-full py-4 text-xs tracking-[0.3em] font-bold transition-colors border-2 ${
                  added
                    ? "bg-white text-black border-white"
                    : !selectedSize || !selectedColor
                    ? "bg-transparent text-white/20 border-[#2a2a2a] cursor-not-allowed"
                    : "bg-white text-black border-white hover:bg-black hover:text-white"
                }`}
              >
                {added
                  ? locale === "nl"
                    ? "TOEGEVOEGD ✓"
                    : "ADDED ✓"
                  : !selectedSize || !selectedColor
                  ? locale === "nl"
                    ? "SELECTEER MAAT & KLEUR"
                    : "SELECT SIZE & COLOR"
                  : t.shop.add_to_cart}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 text-xs tracking-[0.3em] font-bold bg-transparent text-white/20 border-2 border-[#2a2a2a] cursor-not-allowed"
              >
                {t.shop.sold_out}
              </button>
            )}

            {/* Description */}
            <div className="mt-10 pt-8 border-t border-[#1a1a1a]">
              <p className="text-white/40 text-xs tracking-[0.2em] font-bold mb-4 uppercase">
                {t.shop.description}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                {product.description[locale]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
