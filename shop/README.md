# 4THQRT Webshop

Professionele Next.js webshop voor het kledingmerk **4THQRT**.

## Snel starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Stripe activeren

1. Maak een account aan op [stripe.com](https://stripe.com)
2. Ga naar **Developers → API keys** in het Stripe dashboard
3. Kopieer je **Secret key** en **Publishable key**
4. Open `.env.local` en vervang de placeholders:

```env
STRIPE_SECRET_KEY=sk_test_jouw_echte_key_hier
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_jouw_echte_key_hier
```

5. Zolang `STRIPE_SECRET_KEY` de placeholder waarde heeft, werkt de checkout in **demo-modus** (geen echte betaling).

### Betalingsmethoden activeren

In het Stripe dashboard onder **Settings → Payment methods**:
- Creditcard (standaard actief)
- Bancontact (voor België)
- iDEAL (voor Nederland)

---

## Producten toevoegen / aanpassen

Pas het bestand `src/lib/products.ts` aan:

```typescript
{
  id: "7",                          // uniek ID
  slug: "4thqrt-nieuw-product",     // URL-slug (lowercase, koppeltekens)
  name: {
    nl: "NAAM IN HET NEDERLANDS",
    en: "NAME IN ENGLISH",
  },
  description: {
    nl: "Beschrijving in het Nederlands.",
    en: "Description in English.",
  },
  price: 59.95,                     // prijs in euro
  category: "tshirt",               // "tshirt" | "hoodie" | "accessory"
  sizes: ["S", "M", "L", "XL"],
  colors: ["Zwart", "Wit"],
  images: [
    "/products/jouw-foto.jpg",      // lokaal in /public/products/
    // of een externe URL
  ],
  inStock: true,
}
```

Foto's plaatsen: zet productiefoto's in `public/products/` en verwijs ernaar als `/products/foto.jpg`.

---

## Productfoto's zwart-wit

Alle productafbeeldingen zijn via CSS automatisch zwart-wit gefilterd:

```css
/* Verwijder de grayscale class als je kleurenfoto's wil gebruiken */
filter: grayscale(100%);
```

Om kleurenfoto's te tonen: verwijder de `grayscale` class van de `<Image>` componenten in:
- `src/components/ProductCard.tsx`
- `src/app/shop/[slug]/page.tsx`

---

## Talen

De webshop is beschikbaar in **Nederlands** en **Engels**. Alle teksten staan in `src/lib/translations.ts`. De taalschakelaar staat rechts bovenaan in de navigatie (NL | EN).

---

## Deployment

### Vercel (aanbevolen)
```bash
npm install -g vercel
vercel
```
Voeg je Stripe keys toe als Environment Variables in het Vercel dashboard.

### Zelf hosten
```bash
npm run build
npm start
```

---

## Structuur

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── over-ons/             # Ons verhaal
│   ├── shop/                 # Productoverzicht + detailpagina's
│   ├── winkelwagen/          # Winkelwagen
│   ├── checkout/             # Afrekenen
│   ├── verzending/           # Verzending & retour
│   ├── contact/              # Contact
│   ├── privacy/              # Privacybeleid
│   ├── voorwaarden/          # Algemene voorwaarden
│   ├── bestelling-geplaatst/ # Bevestigingspagina
│   └── api/checkout/         # Stripe checkout API
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── CookieBanner.tsx
├── contexts/
│   ├── CartContext.tsx        # Winkelwagen state (localStorage)
│   └── LocaleContext.tsx      # Taal state
└── lib/
    ├── products.ts            # Productdata — hier producten toevoegen
    └── translations.ts        # Alle teksten NL + EN
```
