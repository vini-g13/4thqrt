"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function PrivacyPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="bg-black min-h-screen">
      <section className="pt-20 pb-12 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-5xl md:text-7xl text-white leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
          >
            {t.privacy.title}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto prose-custom space-y-8">
          {locale === "nl" ? (
            <>
              <Section title="1. Verantwoordelijke">
                <p>4THQRT, België. BTW-nummer: BE0000.000.000 (placeholder). E-mail: info@4thqrt.com</p>
              </Section>
              <Section title="2. Welke gegevens we verzamelen">
                <p>We verzamelen naam, e-mailadres en leveringsadres bij een aankoop of contactverzoek. We verzamelen ook technische gegevens (cookies, IP-adressen) voor het functioneren van de webshop.</p>
              </Section>
              <Section title="3. Waarvoor we ze gebruiken">
                <p>Verwerking van bestellingen, verzending en klantenservice. We verkopen jouw gegevens nooit aan derden.</p>
              </Section>
              <Section title="4. Bewaartermijn">
                <p>Persoonsgegevens worden bewaard zolang als nodig voor de dienstverlening en conform de wettelijke verplichtingen (max. 7 jaar voor fiscale gegevens).</p>
              </Section>
              <Section title="5. Jouw rechten">
                <p>Je hebt het recht op inzage, correctie, verwijdering en overdraagbaarheid van jouw gegevens. Stuur een verzoek naar info@4thqrt.com</p>
              </Section>
              <Section title="6. Cookies">
                <p>We gebruiken enkel functionele cookies (winkelwagen) en analytische cookies (anoniem). Je kan cookies weigeren via de cookiebanner.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Controller">
                <p>4THQRT, Belgium. VAT: BE0000.000.000 (placeholder). Email: info@4thqrt.com</p>
              </Section>
              <Section title="2. Data we collect">
                <p>We collect name, email address and delivery address for purchases or contact requests. We also collect technical data (cookies, IP addresses) for shop functionality.</p>
              </Section>
              <Section title="3. How we use it">
                <p>Order processing, shipping and customer service. We never sell your data to third parties.</p>
              </Section>
              <Section title="4. Retention">
                <p>Personal data is retained as long as necessary for service delivery and in compliance with legal obligations (max. 7 years for financial data).</p>
              </Section>
              <Section title="5. Your rights">
                <p>You have the right to access, correct, delete and transfer your data. Send a request to info@4thqrt.com</p>
              </Section>
              <Section title="6. Cookies">
                <p>We use only functional cookies (shopping cart) and anonymous analytics cookies. You can decline cookies via the cookie banner.</p>
              </Section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs tracking-[0.2em] font-bold text-white mb-4 uppercase">{title}</h2>
      <div className="text-white/50 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
