"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function ContactPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: in productie koppelen aan e-mailservice
    setSubmitted(true);
  }

  return (
    <div className="bg-black min-h-screen">
      <section className="pt-20 pb-12 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-6xl md:text-8xl text-white leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            {t.contact.title}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Info */}
          <div className="space-y-10">
            <div>
              <p className="text-white/30 text-xs tracking-[0.2em] font-bold mb-3 uppercase">{t.contact.email_label}</p>
              <a
                href="mailto:info@4thqrt.com"
                className="text-white text-sm hover:text-white/60 transition-colors"
              >
                info@4thqrt.com
              </a>
            </div>
            <div>
              <p className="text-white/30 text-xs tracking-[0.2em] font-bold mb-3 uppercase">{t.contact.social_label}</p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-white/60 transition-colors"
                >
                  @4thqrt
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-white/60 transition-colors"
                >
                  @4thqrt
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="border border-[#1a1a1a] p-8">
                <p className="text-white/60 text-sm leading-relaxed">{t.contact.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name">{t.contact.name}</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email">{t.contact.email}</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="message">{t.contact.message}</label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black text-xs tracking-[0.3em] font-bold py-4 hover:bg-white/80 transition-colors"
                >
                  {t.contact.send}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
