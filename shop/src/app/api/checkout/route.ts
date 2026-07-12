import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key from env
// Set STRIPE_SECRET_KEY in .env.local before going live
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder";

export async function POST(req: NextRequest) {
  if (stripeSecretKey === "sk_test_placeholder") {
    // Demo mode: redirect to success without real Stripe
    return NextResponse.json({
      url: `${req.nextUrl.origin}/bestelling-geplaatst?demo=true`,
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });

  try {
    const { items, customerInfo, locale, shippingCost } = await req.json();

    const lineItems = items.map((item: {
      name: string;
      price: number;
      quantity: number;
      image: string;
    }) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: locale === "nl" ? "Verzendkosten" : "Shipping",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "bancontact", "ideal"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ["BE", "NL"],
      },
      success_url: `${req.nextUrl.origin}/bestelling-geplaatst?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/checkout`,
      locale: locale === "nl" ? "nl" : "en",
      metadata: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        address: customerInfo.address,
        postal: customerInfo.postal,
        city: customerInfo.city,
        country: customerInfo.country,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Stripe checkout kon niet worden aangemaakt." },
      { status: 500 }
    );
  }
}
