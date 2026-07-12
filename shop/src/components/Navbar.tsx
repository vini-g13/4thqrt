"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { useState } from "react";

export default function Navbar() {
  const { totalItems } = useCart();
  const { locale, setLocale } = useLocale();
  const t = getTranslations(locale);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/4th_wit.png"
            alt="4THQRT"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-white text-xs tracking-[0.2em] hover:text-white/60 transition-colors font-bold">
            {t.nav.shop}
          </Link>
          <Link href="/over-ons" className="text-white text-xs tracking-[0.2em] hover:text-white/60 transition-colors font-bold">
            {t.nav.about}
          </Link>
          <Link href="/verzending" className="text-white text-xs tracking-[0.2em] hover:text-white/60 transition-colors font-bold">
            {t.nav.shipping}
          </Link>
          <Link href="/contact" className="text-white text-xs tracking-[0.2em] hover:text-white/60 transition-colors font-bold">
            {t.nav.contact}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Language toggle */}
          <div className="flex items-center gap-2 text-xs tracking-[0.15em] font-bold">
            <button
              onClick={() => setLocale("en")}
              className={`transition-colors ${locale === "en" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              EN
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setLocale("nl")}
              className={`transition-colors ${locale === "nl" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              NL
            </button>
          </div>

          {/* Cart */}
          <Link href="/winkelwagen" className="relative text-white text-xs tracking-[0.2em] font-bold hover:text-white/60 transition-colors hidden md:block">
            {t.nav.cart}
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Cart icon mobile */}
          <Link href="/winkelwagen" className="relative md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-[#1a1a1a] px-4 py-6 flex flex-col gap-6">
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-white text-sm tracking-[0.2em] font-bold">
            {t.nav.shop}
          </Link>
          <Link href="/over-ons" onClick={() => setMenuOpen(false)} className="text-white text-sm tracking-[0.2em] font-bold">
            {t.nav.about}
          </Link>
          <Link href="/verzending" onClick={() => setMenuOpen(false)} className="text-white text-sm tracking-[0.2em] font-bold">
            {t.nav.shipping}
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-white text-sm tracking-[0.2em] font-bold">
            {t.nav.contact}
          </Link>
          <Link href="/winkelwagen" onClick={() => setMenuOpen(false)} className="text-white text-sm tracking-[0.2em] font-bold">
            {t.nav.cart} {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      )}
    </nav>
  );
}
