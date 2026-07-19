import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["owner", "manager"].includes(profile.role)) return NextResponse.json({ error: "Geen adminrechten." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  const { variantId, targetQuantity, priceCents, isActive } = body as Record<string, unknown>;
  if (typeof variantId !== "string") return NextResponse.json({ error: "Ongeldige variant." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (targetQuantity !== undefined) {
    if (!Number.isInteger(targetQuantity) || (targetQuantity as number) < 0 || (targetQuantity as number) > 100000) return NextResponse.json({ error: "Ongeldige doelvoorraad." }, { status: 400 });
    update.target_quantity = targetQuantity;
  }
  if (priceCents !== undefined) {
    if (!Number.isInteger(priceCents) || (priceCents as number) < 0 || (priceCents as number) > 10000000) return NextResponse.json({ error: "Ongeldige prijs." }, { status: 400 });
    update.price_cents = priceCents;
  }
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") return NextResponse.json({ error: "Ongeldige zichtbaarheid." }, { status: 400 });
    update.is_active = isActive;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Geen wijziging opgegeven." }, { status: 400 });

  const { data, error } = await supabase.from("product_variants").update(update).eq("id", variantId).select().maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Variant kon niet worden bijgewerkt." }, { status: 409 });
  return NextResponse.json({ ok: true, variant: data });
}
