"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function Footer() {
  const { locale, setLocale } = useLocale();
  const t = getTranslations(locale);

  return (
    <footer className="bg-black border-t border-[#1a1a1a] mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Image
              src="/4th_wit.png"
              alt="4THQRT"
              width={100}
              height={33}
              className="h-7 w-auto mb-6"
            />
            <p className="text-white/40 text-xs leading-relaxed tracking-wide max-w-xs">
              {locale === "nl"
                ? "Het laatste kwart bepaalt alles."
                : "The fourth quarter decides everything."}
            </p>
          </div>

          {/* Links */}
          <div>
            <nav className="flex flex-col gap-4">
              <Link href="/shop" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.shop}
              </Link>
              <Link href="/over-ons" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.about}
              </Link>
              <Link href="/verzending" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.shipping}
              </Link>
              <Link href="/contact" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.contact}
              </Link>
              <Link href="/privacy" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.privacy}
              </Link>
              <Link href="/voorwaarden" className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold">
                {t.footer.terms}
              </Link>
            </nav>
          </div>

          {/* Socials + Language */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-white/30 text-xs tracking-[0.2em] mb-4 font-bold">SOCIALS</p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold"
                >
                  INSTAGRAM
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 text-xs tracking-[0.15em] hover:text-white transition-colors font-bold"
                >
                  TIKTOK
                </a>
              </div>
            </div>

            <div>
              <p className="text-white/30 text-xs tracking-[0.2em] mb-4 font-bold">TAAL / LANGUAGE</p>
              <div className="flex items-center gap-3 text-xs tracking-[0.15em] font-bold">
                <button
                  onClick={() => setLocale("nl")}
                  className={`transition-colors ${locale === "nl" ? "text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  NL
                </button>
                <span className="text-white/20">|</span>
                <button
                  onClick={() => setLocale("en")}
                  className={`transition-colors ${locale === "en" ? "text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/20 text-xs tracking-wide">{t.footer.rights}</p>
          <p className="text-white/20 text-xs tracking-wide">{t.footer.vat}</p>
        </div>
      </div>
    </footer>
  );
}
