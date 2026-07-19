import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const REASONS = ["initial_stock", "delivery", "adjustment", "damaged", "return"] as const;

export async function POST(request: Request) {
  const limit = await enforceRateLimit(request, "admin-inventory", 30, 10 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.reason === "limited" ? "Te veel wijzigingen. Probeer later opnieuw." : "Tijdelijk niet beschikbaar." },
      { status: limit.reason === "limited" ? 429 : 503 }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["owner", "manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Geen adminrechten." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  const { variantId, delta, reason, note } = body as Record<string, unknown>;
  if (
    typeof variantId !== "string" ||
    !Number.isInteger(delta) ||
    (delta as number) === 0 ||
    Math.abs(delta as number) > 10000 ||
    typeof reason !== "string" ||
    !REASONS.includes(reason as (typeof REASONS)[number]) ||
    (note !== undefined && (typeof note !== "string" || note.length > 500))
  ) {
    return NextResponse.json({ error: "Ongeldige voorraadwijziging." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("record_inventory_movement", {
    p_variant_id: variantId,
    p_delta: delta,
    p_reason: reason,
    p_note: typeof note === "string" ? note : null,
  });

  if (error || !data) {
    return NextResponse.json({ error: "Voorraad kon niet worden aangepast." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, variant: data });
}
