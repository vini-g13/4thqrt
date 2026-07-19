"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-8 px-4">
        <h1
          className="text-5xl md:text-7xl text-white"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
        >
          {t.cart.title}
        </h1>
        <p className="text-white/40 text-sm tracking-wide">{t.cart.empty}</p>
        <Link
          href="/shop"
          className="border-2 border-white text-white text-xs tracking-[0.25em] font-bold px-8 py-3 hover:bg-white hover:text-black transition-colors"
        >
          {t.cart.empty_cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1
          className="text-5xl md:text-7xl text-white mb-12"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
        >
          {t.cart.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-px">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 bg-[#0a0a0a] border border-[#1a1a1a] p-4"
              >
                <div className="relative w-20 aspect-[4/5] flex-shrink-0 overflow-hidden bg-[#111]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover grayscale"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs tracking-[0.1em] font-bold mb-1 truncate">{item.name}</p>
                  <p className="text-white/40 text-xs mb-3">
                    {item.size} · {item.color}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="w-7 h-7 border border-[#2a2a2a] text-white text-sm hover:border-white/40 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="w-7 h-7 border border-[#2a2a2a] text-white text-sm hover:border-white/40 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="text-white text-sm font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-white/20 text-xs tracking-[0.1em] hover:text-white/60 transition-colors"
                  >
                    {t.cart.remove}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 h-fit">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/40 text-xs tracking-[0.15em] font-bold uppercase">{t.cart.subtotal}</span>
              <span className="text-white text-sm font-bold">€{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-white/30 text-xs mb-8 leading-relaxed">{t.cart.shipping_note}</p>
            <Link
              href="/checkout"
              className="block w-full bg-white text-black text-center text-xs tracking-[0.25em] font-bold py-4 hover:bg-white/80 transition-colors"
            >
              {t.cart.checkout}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
