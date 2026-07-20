# 4THQRT intern werkdocument

Niet delen met de klant. Dit document is het centrale interne overzicht van de scope, technische status, livegang en open acties.

Laatst bijgewerkt: 20 juli 2026.

## 1. Kernopzet

- De webshop is een Next.js-app in `shop/`.
- Railway host de bestaande website. Er is geen tweede Railway-project, aparte service of admin-subdomein nodig.
- Supabase is gekozen voor PostgreSQL, Auth, voorraadgegevens, rate limiting en later Storage.
- De admin staat op `/admin`; de login hoort op `/admin/login`.
- Stripe is bewust nog niet aangesloten. De huidige checkout is alleen een demo-flow.

## 2. Admin-loginroute: huidige status

Status: **functioneel, lokaal gebouwd en succesvol getest op 20 juli 2026.**

De loginpagina staat in:

```text
shop/src/app/(admin-login)/admin/login/page.tsx
```

In Next.js zijn mapnamen tussen haakjes alleen interne routegroepen. Ze komen niet voor in de URL. De openbare route blijft dus correct:

```text
/admin/login
```

De lokale Supabase-configuratie is nu actief. Inloggen met het aangemaakte adminaccount is lokaal succesvol getest. De admin is daarmee klaar om in de volgende chat verder visueel en functioneel verfijnd te worden.

De routegroep en de recente voorraadwijzigingen staan nog niet in Git. Voeg alleen deze relevante bestanden toe en push ze naar Railway:

```powershell
git add -- "shop/src/app/(admin-login)/admin/login/page.tsx"
git add -- "shop/src/app/(store)/shop/[slug]/page.tsx"
git add -- "shop/src/lib/products.ts"
git add -- "docs/4THQRT_intern_werkdocument.md"
git commit -m "Refine admin login and stock display"
git push
```
## 3. Reeds uitgevoerd

### Layout en zichtbare website

- De ongewenste zwarte tussenruimte boven de footer op de homepage is verwijderd.
- Dezelfde ongewenste zwarte tussenruimte op de Our Story-pagina is verwijderd.
- De publieke shoplayout is afgescheiden van de adminlayout met Next.js-routegroepen:
  - storefront: `shop/src/app/(store)/`
  - admin-login: `shop/src/app/(adminlogin)/`
  - admin: `shop/src/app/admin/`
- Daardoor mogen de publieke navigatie, footer en drop-wall niet meer op de admin verschijnen.
- Productnamen en zichtbare prijsnotatie zijn hersteld naar leesbare tekst zonder mojibake/rare tekens.
- De voorraadbar staat niet langer op productkaarten. Ze verschijnt enkel op de productdetailpagina nadat een concrete kleur en maat zijn gekozen.

### Supabase, admin en voorraad

- Supabase-clientcode voor browser en server is toegevoegd.
- Database-schema, toegangsregels, voorraadmutaties en server-side rate limiting zijn voorbereid.
- Admin-login gebruikt Supabase Auth.
- Alleen Supabase-rollen `owner` en `manager` mogen de admin openen.
- De admin bevat voorraadbeheer per productvariant (kleur en maat).
- Voorraadwijzigingen worden gelogd en mogen niet onder nul gaan.
- De voorraadbar rekent met actuele voorraad tegenover doelvoorraad.
- Als de catalogus lokaal naar de fallback terugvalt, staat de zwarte longsleeve in maat M bewust op 7/10 om een 70%-bar te tonen. Met een werkende Supabase-verbinding overschrijven de echte voorraadaantallen uit de database deze demo-data.
- De publieke catalogus haalt gewijzigde voorraad periodiek opnieuw op, zodat adminwijzigingen zichtbaar kunnen worden zonder nieuwe frontend-deploy.

### Checkout en beveiliging

- Prijzen, verzending en voorraad worden niet langer vanuit de browser vertrouwd.
- De browser stuurt enkel productslug, kleur, maat en aantal; de server leidt prijzen en voorraad af uit de catalogus/database.
- De demo-checkout is expliciet via `CHECKOUT_DEMO_MODE=true`; zij maakt geen echte betaalde bestelling en verlaagt geen voorraad.
- Rate limiting is toegevoegd via Supabase en een gehashte clientidentifier:
  - checkout: 10 aanvragen per 10 minuten;
  - drop unlock: 5 pogingen per 15 minuten;
  - drop validatie: 30 controles per 15 minuten;
  - drop-mail: 3 aanvragen per uur.
- In productie weigeren deze routes wanneer verplichte configuratie ontbreekt.
- Next.js is bijgewerkt naar `16.2.10`; hiermee zijn de bekende high-severity kwetsbaarheden uit de vorige Next-versie weggewerkt.

### Drop-wall en copy

- De drop-wall flow en visuele compositie zijn verfijnd.
- Landingpage- en Our Story-copy zijn aangepast volgens eerdere klantfeedback.
- Contactformulier, sociale links en definitieve productcontent zijn bewust nog niet actief omdat e-mail, socials en productfotografie nog ontbreken.

## 4. Databasebestanden en uitvoering

Deze SQL-migraties staan klaar in `shop/supabase/migrations/`:

1. `202607190001_initial_store.sql` - tabellen, toegangsregels, voorraadmutaties en rate limiting.
2. `202607190002_seed_demo_catalog.sql` - demo-producten en varianten.
3. `202607190003_fix_demo_product_names.sql` - corrigeert productnamen die al in een bestaande demo-database staan.

De projecteigenaar moet ze in deze volgorde uitvoeren in de Supabase SQL Editor. Migratie 3 is vooral noodzakelijk als migratie 2 al eerder is uitgevoerd.

Na het aanmaken van het adminaccount in Supabase moet diens UUID de rol `owner` krijgen:

```sql
update public.profiles
set role = 'owner'
where id = '<uuid-van-het-adminaccount>';
```

Openbare registratie in Supabase Auth moet uit blijven.

## 5. Verplichte Railway-variabelen voor deze fase

Alleen in Railway instellen, nooit in Git committen:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SECRET=
CHECKOUT_DEMO_MODE=true
DROP_SECRET_KEY=
```

Betekenis:

- `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publieke Supabase-verbinding voor de browser.
- `SUPABASE_SERVICE_ROLE_KEY`: uitsluitend server-side; nooit een `NEXT_PUBLIC_`-prefix geven.
- `RATE_LIMIT_SECRET`: lange willekeurige waarde die IP-adressen veilig hasht voor rate limiting.
- `CHECKOUT_DEMO_MODE=true`: laat enkel de huidige demonstratiecheckout toe.
- `DROP_SECRET_KEY`: lange willekeurige waarde voor de drop-flow.

Later voor betalingen en mail:

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
DROP_FROM_EMAIL=
```

## 6. Laatste technische verificatie

Op 20 juli 2026 is de productiebuild lokaal succesvol uitgevoerd op de huidige versie:

```text
npm run build
```

De build compileerde, doorliep TypeScript en genereerde alle 22 pagina's, inclusief `/admin` en `/admin/login`.

De build genereert onder meer `/admin`, `/admin/login` en alle publieke pagina's zonder fouten.

## 7. Resterende acties, in juiste volgorde

### Nu: nodig om admin en voorraad te gebruiken

1. Voeg de huidige admin-loginroute toe aan Git en push ze naar Railway zoals beschreven in sectie 2.
2. Maak een Supabase-project in een EU-regio.
3. Voer de drie SQL-migraties uit, in volgorde.
4. Maak het adminaccount aan in Supabase Auth en ken de rol `owner` toe.
5. Voeg de verplichte Railway-variabelen toe.
6. Deploy op Railway en test:
   - `/admin/login`;
   - inloggen;
   - voorraad toevoegen/aanpassen;
   - zichtbaarheid van voorraad op een productdetailpagina;
   - checkout in demo-modus;
   - rate-limitreacties na herhaalde pogingen.

### Voor echte verkoop: pas wanneer Stripe-account klaar is

1. Stripe Checkout koppelen.
2. Een geverifieerde Stripe-webhook bouwen en valideren.
3. Pas na een geldige webhook een bestelling als betaald markeren.
4. Pas daarna voorraad automatisch verlagen, bestelling opslaan en fulfillment starten.
5. Testbetalingen, mislukte betalingen, dubbele webhooks en voorraadtekorten testen.

Zonder deze webhook mag voorraad nooit als reactie op enkel een browsermelding worden verlaagd.

### Voor live content en communicatie

- Definitieve productfoto's en productinformatie vervangen.
- Teksten op homepage en Our Story laten aanpassen door de klant.
- Professioneel e-mailadres instellen.
- Contactformulier koppelen aan een verzenddienst/mailbox.
- Sociale media-links invullen zodra accounts bestaan.
- Privacybeleid, voorwaarden, retourbeleid, bedrijf- en btw-gegevens inhoudelijk laten controleren.

### Mogelijke adminuitbreidingen

- Producten aanmaken en archiveren vanuit de admin.
- Productfoto-upload via Supabase Storage.
- Besteloverzicht en fulfillmentstatus.
- Voorraadimport/export.
- Waarschuwing bij lage voorraad.

## 8. Livegangchecklist

- [ ] Admin-loginroute, voorraadbar en werkdocument gecommit, gepusht en gedeployd.
- [ ] Supabase-migraties uitgevoerd.
- [x] Lokaal owner-account aangemaakt en admin-login getest.
- [ ] Railway-secrets ingesteld, zonder ze in Git op te nemen.
- [ ] Definitieve content en productfoto's geplaatst.
- [ ] Juridische pagina's en bedrijfsgegevens gecontroleerd.
- [ ] Stripe checkout + webhook afgerond en getest.
- [ ] Contactmail en contactformulier getest.
- [ ] Mobiele en desktop eindcontrole uitgevoerd.
- [ ] Bestel-, voorraad- en foutscenario's getest.

## 9. Overdracht naar de volgende chat

### Bevestigd werkend lokaal

- De lokale Next.js-server draait/draaide op `http://localhost:3000`.
- `npm run build` is succesvol afgerond op 20 juli 2026.
- `/admin/login` werkt met het lokale Supabase-adminaccount.
- De admin bevat geen publieke shopnavigatie of footer.
- De voorraadbar verschijnt op de productdetailpagina na selectie van kleur en maat.
- De zichtbare percentagewaarde naast de voorraadbar is verwijderd; de voorraadberekening stuurt alleen nog de vulling van de balk.
- Voor visuele controle staat de fallback voor de zwarte longsleeve, maat M, op 7 van 10 (70% gevuld). Echte Supabase-data kan dit overschrijven.

### Volgende focus

In de volgende chat: voorraadpagina en adminpagina verder verbeteren. Mogelijke punten:

- adminlayout en typografie verfijnen;
- voorraad muteren eenvoudiger en duidelijker maken;
- tonen welke variant wordt aangepast;
- bevestiging, foutmeldingen en lage-voorraadindicaties verbeteren;
- beslissen welke voorraadinfo zichtbaar mag zijn voor klanten;
- daarna opnieuw lokaal testen, `npm run build` uitvoeren en alleen relevante bestanden committen.

### Huidige relevante, nog niet-gecommitte wijzigingen

- `shop/src/app/(admin-login)/admin/login/page.tsx` (routebestand; map is momenteel nieuw voor Git);
- `shop/src/app/(store)/shop/[slug]/page.tsx` (percentage naast voorraadbar verwijderd);
- `shop/src/lib/products.ts` (lokale fallbackvoorraad, zwarte M op 7/10);
- `docs/4THQRT_intern_werkdocument.md` (dit document).

Niet-gerelateerde lokale documenten, afbeeldingen en `pr 4th.txt` buiten deze commit houden.
## 10. Interne aandachtspunten

- Commit alleen relevante `shop/`- en documentatiebestanden.
- Niet-gerelateerde afbeeldingen, Word-documenten en `pr 4th.txt` niet per ongeluk meenemen in een websitecommit.
- Secrets horen alleen in Railway/Supabase en nooit in `.env.example`, Git of screenshots.
- Het technische implementatieplan staat in `docs/supabase-railway-implementation-plan.md`.
- Bij volgende aanpassingen eerst `npm run build` uitvoeren voordat er naar Railway wordt gepusht.