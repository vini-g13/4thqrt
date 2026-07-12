# Drop e-mailwall met secret key — ontwerp

Datum: 2026-07-12 · Project: 4thqrt webshop (`shop/`)

## Doel

De drop-wall (DROP_MODE) wordt een echte teaser met wow-effect: een bezoeker
laat zijn e-mail achter, ontvangt automatisch een mail met een secret key, en
ontgrendelt daarmee de volledige webshop. De site gaat live op Railway zodat
de klant een link krijgt om door de site te scrollen.

## Flow

1. Bezoeker opent de site → ziet drop-wall ("Something is coming. Stay ready.")
2. Onder het e-mailveld staat: "Enter your email to get your secret key."
3. E-mail invullen → `POST /api/drop/notify` → Resend stuurt branded mail met de key
4. Scherm toont key-veld → `POST /api/drop/unlock` → server vergelijkt
   (hoofdletterongevoelig) met `DROP_SECRET_KEY` → zet httpOnly-cookie
   `qrt_access` (30 dagen) → pagina herlaadt → volledige webshop zichtbaar

## Beslissingen

- **Mail via Resend** (niet one.com-SMTP): HTTPS API is betrouwbaar vanaf
  Railway; SMTP-poorten zijn vanaf cloudplatformen vaak geblokkeerd.
- **Secret key = `4THQRT`** — in env var `DROP_SECRET_KEY`, dus aanpasbaar
  zonder code-wijziging. Check is server-side (key staat niet in de bundle).
- **Cookie-gate in root layout** (server-side, `await cookies()`), geen
  middleware — eenvoudigst, en de shop mag volledig dynamisch renderen.
- **Zonder `RESEND_API_KEY`** draait de notify-route in demo-modus (mail wordt
  niet verstuurd, flow blijft lokaal testbaar).

## Env vars (Railway + lokaal)

- `RESEND_API_KEY` — door eigenaar zelf in Railway-dashboard te plakken
- `DROP_FROM_EMAIL` — afzender op geverifieerd domein, bv. `4THQRT <drop@domein>`
- `DROP_SECRET_KEY` — `4THQRT`

## Deploy

`shop/.git` (per ongeluk geneste lege repo) wordt verwijderd zodat de shopcode
echt in de `4thqrt`-repo komt; push naar GitHub (`vini-g13/4thqrt`); in Railway
service aanmaken met root directory `shop` (Next.js autodetect, `next start`
respecteert `PORT`). DROP_MODE blijft aan op productie — dat is de teaser.
