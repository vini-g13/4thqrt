import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { parseCheckoutPayload, verifyCheckout } from "@/lib/checkout";
import { enforceRateLimit } from "@/lib/rate-limit";

function rateLimitResponse(result: Exclude<Awaited<ReturnType<typeof enforceRateLimit>>, { allowed: true }>) {
  if (result.reason === "unavailable") {
    return NextResponse.json({ error: "Checkout is tijdelijk niet beschikbaar." }, { status: 503 });
  }

  return NextResponse.json(
    { error: "Te veel pogingen. Probeer later opnieuw." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}

export async function POST(request: NextRequest) {
  const limit = await enforceRateLimit(request, "checkout", 10, 10 * 60);
  if (!limit.allowed) return rateLimitResponse(limit);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = parseCheckoutPayload(payload);
  if (!parsed) {
    return NextResponse.json({ error: "Controleer je winkelmandje en gegevens." }, { status: 400 });
  }

  // Prijs, voorraad en verzending komen uitsluitend van de server.
  const checkout = await verifyCheckout(parsed.selections, parsed.locale, parsed.customerInfo);
  if (!checkout) {
    return NextResponse.json(
      { error: "Een product is niet meer beschikbaar of je winkelmandje is ongeldig." },
      { status: 409 }
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const demoMode =
    process.env.CHECKOUT_DEMO_MODE === "true" ||
    (process.env.NODE_ENV !== "production" && !stripeSecretKey);

  if (!stripeSecretKey) {
    if (!demoMode) {
      return NextResponse.json({ error: "Betalingen zijn nog niet geconfigureerd." }, { status: 503 });
    }

    return NextResponse.json({
      url: `${request.nextUrl.origin}/bestelling-geplaatst?demo=true`,
      demo: true,
      totalCents: checkout.totalCents,
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "bancontact", "ideal"],
      line_items: [
        ...checkout.lines.map((line) => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: line.productName,
              images: line.image ? [line.image] : undefined,
            },
            unit_amount: line.unitPriceCents,
          },
          quantity: line.quantity,
        })),
        ...(checkout.shippingCents > 0
          ? [{
              price_data: {
                currency: "eur",
                product_data: {
                  name: checkout.locale === "nl" ? "Verzendkosten" : "Shipping",
                },
                unit_amount: checkout.shippingCents,
              },
              quantity: 1,
            }]
          : []),
      ],
      mode: "payment",
      customer_email: checkout.customerInfo.email,
      shipping_address_collection: { allowed_countries: ["BE", "NL"] },
      success_url: `${request.nextUrl.origin}/bestelling-geplaatst?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout`,
      locale: checkout.locale,
      metadata: {
        firstName: checkout.customerInfo.firstName,
        lastName: checkout.customerInfo.lastName,
        address: checkout.customerInfo.address,
        postal: checkout.customerInfo.postal,
        city: checkout.customerInfo.city,
        country: checkout.customerInfo.country,
        checkoutVersion: "server-verified-v1",
      },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Stripe checkout kon niet worden aangemaakt." }, { status: 502 });
  }
}