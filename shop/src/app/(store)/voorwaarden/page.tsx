"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";

export default function TermsPage() {
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
            {t.terms.title}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {locale === "nl" ? (
            <>
              <Section title="1. Identiteit">
                <p>4THQRT, België. BTW-nummer: BE0000.000.000 (placeholder). E-mail: info@4thqrt.com</p>
              </Section>
              <Section title="2. Bestelling plaatsen">
                <p>Door een bestelling te plaatsen ga je akkoord met deze algemene voorwaarden. Na bestelling ontvang je een bevestigingse-mail. Wij behouden het recht om bestellingen te weigeren.</p>
              </Section>
              <Section title="3. Prijzen">
                <p>Alle prijzen zijn in euro en inclusief BTW. Verzendkosten worden apart vermeld. We behouden het recht om prijzen te wijzigen.</p>
              </Section>
              <Section title="4. Levering">
                <p>We leveren in België en Nederland. Levertijd: 2–4 werkdagen. Bij vertraging verwittigen we je per e-mail.</p>
              </Section>
              <Section title="5. Herroepingsrecht">
                <p>Je hebt 14 dagen na ontvangst om de aankoop zonder opgave van reden te herroepen. Stuur de goederen ongedragen en in originele staat terug. Retourkosten zijn voor de klant.</p>
              </Section>
              <Section title="6. Garantie">
                <p>Wettelijke garantie van 2 jaar op productiefout. Geen garantie op normale slijtage.</p>
              </Section>
              <Section title="7. Toepasselijk recht">
                <p>Belgisch recht is van toepassing. Geschillen worden voorgelegd aan de bevoegde rechtbanken van het arrondissement van de maatschappelijke zetel.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Identity">
                <p>4THQRT, Belgium. VAT: BE0000.000.000 (placeholder). Email: info@4thqrt.com</p>
              </Section>
              <Section title="2. Placing an order">
                <p>By placing an order you agree to these terms. After ordering you will receive a confirmation email. We reserve the right to refuse orders.</p>
              </Section>
              <Section title="3. Prices">
                <p>All prices are in euros and include VAT. Shipping costs are stated separately. We reserve the right to change prices.</p>
              </Section>
              <Section title="4. Delivery">
                <p>We deliver to Belgium and the Netherlands. Delivery time: 2–4 business days. In case of delay we will notify you by email.</p>
              </Section>
              <Section title="5. Right of withdrawal">
                <p>You have 14 days after receipt to withdraw from the purchase without reason. Return the goods unworn and in original condition. Return costs are at the customer's expense.</p>
              </Section>
              <Section title="6. Warranty">
                <p>Legal warranty of 2 years for manufacturing defects. No warranty for normal wear and tear.</p>
              </Section>
              <Section title="7. Applicable law">
                <p>Belgian law applies. Disputes will be submitted to the competent courts of the district of the registered office.</p>
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
