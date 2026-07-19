import { NextResponse } from "next/server";
import { products, type Product } from "@/lib/products";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function fallback() {
  return NextResponse.json({ source: "fallback", products });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback();

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name_nl, name_en, description_nl, description_en, category, image_urls, product_variants(id, size, color, price_cents, available_quantity, target_quantity, is_active)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return fallback();

  const catalog = data.map((product) => {
    const variants = ((product.product_variants ?? []) as Array<{ size: string; color: string; price_cents: number; available_quantity: number; target_quantity: number; is_active: boolean }>).filter((variant) => variant.is_active);
    const available = variants.reduce((sum, variant) => sum + variant.available_quantity, 0);
    const target = variants.reduce((sum, variant) => sum + variant.target_quantity, 0);
    const prices = variants.map((variant) => variant.price_cents);
    const images = Array.isArray(product.image_urls) ? product.image_urls.filter((url): url is string => typeof url === "string") : [];

    return {
      id: product.id,
      slug: product.slug,
      name: { nl: product.name_nl, en: product.name_en },
      description: { nl: product.description_nl, en: product.description_en },
      price: prices.length ? Math.min(...prices) / 100 : 0,
      category: product.category,
      sizes: [...new Set(variants.filter((variant) => variant.available_quantity > 0).map((variant) => variant.size))],
      colors: [...new Set(variants.filter((variant) => variant.available_quantity > 0).map((variant) => variant.color))],
      images,
      inStock: available > 0,
      lowStock: target > 0 && available / target <= 0.25,
      stockPercentage: target > 0 ? Math.min(100, Math.round((available / target) * 100)) : undefined,
    } satisfies Product;
  });

  return NextResponse.json({ source: "supabase", products: catalog });
}
