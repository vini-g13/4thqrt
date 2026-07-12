"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { locale } = useLocale();
  const t = getTranslations(locale);

  useEffect(() => {
    const consent = localStorage.getItem("4thqrt_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("4thqrt_cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("4thqrt_cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 sm:px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-white/60 text-xs tracking-wide">
          {t.cookie.text}{" "}
          <Link href="/privacy" className="text-white underline underline-offset-4">
            {locale === "nl" ? "Meer info" : "More info"}
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="text-white/40 text-xs tracking-[0.15em] font-bold border border-[#2a2a2a] px-4 py-2 hover:border-white/40 transition-colors"
          >
            {t.cookie.decline}
          </button>
          <button
            onClick={accept}
            className="bg-white text-black text-xs tracking-[0.15em] font-bold px-5 py-2 hover:bg-white/80 transition-colors"
          >
            {t.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
