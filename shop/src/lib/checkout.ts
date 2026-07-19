import { getProductBySlug } from "@/lib/products";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHIPPING_COSTS = { BE: 495, NL: 695 } as const;
const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

export type CheckoutLocale = "nl" | "en";

export interface CheckoutSelection {
  slug: string;
  size: string;
  color: string;
  quantity: number;
}

export interface VerifiedCheckoutLine {
  productName: string;
  image: string;
  slug: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
  variantId?: string;
}

export interface VerifiedCheckout {
  locale: CheckoutLocale;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    postal: string;
    city: string;
    country: keyof typeof SHIPPING_COSTS;
  };
  lines: VerifiedCheckoutLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

function asTrimmedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength
    ? value.trim()
    : null;
}

export function parseCheckoutPayload(payload: unknown): {
  selections: CheckoutSelection[];
  locale: CheckoutLocale;
  customerInfo: VerifiedCheckout["customerInfo"];
} | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;
  if (body.privacyAccepted !== true || !Array.isArray(body.items) || body.items.length === 0) return null;

  const customer = body.customerInfo as Record<string, unknown> | undefined;
  if (!customer || typeof customer !== "object") return null;

  const firstName = asTrimmedString(customer.firstName, 80);
  const lastName = asTrimmedString(customer.lastName, 80);
  const email = asTrimmedString(customer.email, 254);
  const address = asTrimmedString(customer.address, 160);
  const postal = asTrimmedString(customer.postal, 20);
  const city = asTrimmedString(customer.city, 100);
  const country = customer.country === "BE" || customer.country === "NL" ? customer.country : null;
  if (!firstName || !lastName || !email || !EMAIL_RE.test(email) || !address || !postal || !city || !country) return null;

  const combined = new Map<string, CheckoutSelection>();
  for (const item of body.items) {
    if (!item || typeof item !== "object") return null;
    const value = item as Record<string, unknown>;
    const slug = asTrimmedString(value.slug, 120);
    const size = asTrimmedString(value.size, 30);
    const color = asTrimmedString(value.color, 50);
    const quantity = value.quantity;
    if (!slug || !size || !color || !Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 10) return null;

    const key = `${slug}:${size}:${color}`;
    const existing = combined.get(key);
    const totalQuantity = (existing?.quantity ?? 0) + (quantity as number);
    if (totalQuantity > 10) return null;
    combined.set(key, { slug, size, color, quantity: totalQuantity });
  }

  if (combined.size > 20) return null;
  return {
    selections: [...combined.values()],
    locale: body.locale === "nl" ? "nl" : "en",
    customerInfo: { firstName, lastName, email, address, postal, city, country },
  };
}

function resolveStaticSelection(selection: CheckoutSelection, locale: CheckoutLocale): VerifiedCheckoutLine | null {
  const product = getProductBySlug(selection.slug);
  if (!product || !product.inStock || !product.sizes.includes(selection.size) || !product.colors.includes(selection.color)) {
    return null;
  }

  return {
    productName: product.name[locale],
    image: product.images[0] ?? "",
    slug: product.slug,
    size: selection.size,
    color: selection.color,
    quantity: selection.quantity,
    unitPriceCents: Math.round(product.price * 100),
  };
}

async function resolveSupabaseSelection(selection: CheckoutSelection, locale: CheckoutLocale): Promise<VerifiedCheckoutLine | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug, name_nl, name_en, image_urls")
    .eq("slug", selection.slug)
    .eq("is_published", true)
    .maybeSingle();
  if (productError || !product) return null;

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, price_cents, available_quantity")
    .eq("product_id", product.id)
    .eq("size", selection.size)
    .eq("color", selection.color)
    .eq("is_active", true)
    .maybeSingle();
  if (variantError || !variant || variant.available_quantity < selection.quantity) return null;

  const images = Array.isArray(product.image_urls) ? product.image_urls.filter((url) => typeof url === "string") : [];
  return {
    productName: locale === "nl" ? product.name_nl : product.name_en,
    image: images[0] ?? "",
    slug: product.slug,
    size: selection.size,
    color: selection.color,
    quantity: selection.quantity,
    unitPriceCents: variant.price_cents,
    variantId: variant.id,
  };
}

export async function verifyCheckout(
  selections: CheckoutSelection[],
  locale: CheckoutLocale,
  customerInfo: VerifiedCheckout["customerInfo"]
): Promise<VerifiedCheckout | null> {
  const useSupabase = Boolean(createSupabaseAdminClient());
  const lines: VerifiedCheckoutLine[] = [];

  for (const selection of selections) {
    const line = useSupabase
      ? await resolveSupabaseSelection(selection, locale)
      : resolveStaticSelection(selection, locale);
    if (!line) return null;
    lines.push(line);
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COSTS[customerInfo.country];
  return {
    locale,
    customerInfo,
    lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}
