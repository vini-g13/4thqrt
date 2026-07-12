"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function OrderSuccessPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center px-4 text-center gap-10">
      <Image
        src="/4th_wit.png"
        alt="4THQRT"
        width={160}
        height={53}
        className="h-12 w-auto"
      />

      <div>
        <h1
          className="text-5xl md:text-7xl text-white mb-6"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
        >
          {t.success.title}
        </h1>
        <p className="text-white/50 text-sm tracking-wide max-w-sm mx-auto leading-relaxed">
          {t.success.message}
        </p>
      </div>

      <div className="w-16 h-16 border-2 border-white flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <Link
        href="/"
        className="border-2 border-white text-white text-xs tracking-[0.3em] font-bold px-10 py-4 hover:bg-white hover:text-black transition-colors"
      >
        {t.success.cta}
      </Link>
    </div>
  );
}
