# 4THQRT — Railway + Supabase implementatieplan

## Gekozen opzet

- **Railway** host de bestaande Next.js-website. Er is geen tweede Railway-project, service of admin-domein nodig.
- **Supabase** levert PostgreSQL, Auth, Storage (later) en toegangsregels.
- De admin staat op **`/admin`** en gebruikt dezelfde website/domeincookie als de shop.
- De publieke dropwall mag aan blijven; `/admin` gebruikt zijn eigen Supabase-login.

## Eenmalig uitvoeren door de projecteigenaar

1. Maak één nieuw Supabase-project aan in de gewenste EU-regio.
2. Open de SQL Editor en voer, in deze volgorde, uit:
   - `shop/supabase/migrations/202607190001_initial_store.sql`
   - `shop/supabase/migrations/202607190002_seed_demo_catalog.sql`
3. Maak in **Authentication > Users** het e-mailadres van de eigenaar aan. Openbare registratie moet uit blijven.
4. Maak dit account eigenaar met de UUID uit `auth.users`:

   ```sql
   update public.profiles
   set role = 'owner'
   where id = '<uuid-van-het-adminaccount>';
   ```

5. Zet in de bestaande Railway-webservice deze variabelen:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   RATE_LIMIT_SECRET=
   CHECKOUT_DEMO_MODE=true
   DROP_SECRET_KEY=
   ```

   `RATE_LIMIT_SECRET` en `DROP_SECRET_KEY` moeten lange, willekeurige waarden zijn. De service-role key blijft uitsluitend in Railway en mag nooit `NEXT_PUBLIC_` krijgen.
6. Deploy de bestaande Railway-service opnieuw.

## Wat deze implementatie doet

### Veilige checkout

- De browser kan geen prijzen of verzendkosten meer bepalen.
- De server gebruikt alleen slug, maat, kleur en aantal en berekent prijs, voorraad en verzending zelf.
- Zolang Stripe niet bestaat, is demo-checkout expliciet via `CHECKOUT_DEMO_MODE=true` mogelijk.
- Een demo maakt geen betaalde bestelling en verlaagt geen voorraad.

### Admin en voorraad

- `/admin/login` gebruikt Supabase Auth.
- Alleen rollen `owner` en `manager` komen op `/admin`.
- Voorraadwijzigingen worden als mutaties gelogd en mogen nooit onder nul uitkomen.
- De doelvoorraad bepaalt de vulling van de voorraadbar.
- Productkaarten halen de Supabase-catalogus iedere twintig seconden opnieuw op; wijzigingen uit de admin worden dus zonder handmatige deploy zichtbaar.

### Rate limiting en productieconfiguratie

- Checkout: 10 aanvragen per 10 minuten.
- Drop-key ontgrendelen: 5 pogingen per 15 minuten.
- Drop-keycontrole: 30 controles per 15 minuten.
- Dropmail: 3 aanvragen per uur.
- In productie weigeren de betrokken routes wanneer Supabase/rate limiting of een noodzakelijke drop-secret niet is geconfigureerd.

## Bewust later

- Stripe Checkout en webhook.
- Orders pas op `paid` zetten na een geverifieerde Stripe-webhook.
- Voorraad automatisch verminderen na echte betaling.
- Professionele mail, contactformulier, finale productfoto's en sociale links.
- Uitbreiding van de admin met product aanmaken, productfoto-upload via Supabase Storage en orderoverzicht.
