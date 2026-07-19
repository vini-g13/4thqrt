"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface AdminVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price_cents: number;
  available_quantity: number;
  target_quantity: number;
  is_active: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name_nl: string;
  name_en: string;
  is_published: boolean;
  product_variants: AdminVariant[];
}

function percentage(available: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((available / target) * 100));
}

export default function InventoryManager({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [busyVariant, setBusyVariant] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function changeStock(variantId: string, delta: number, reason: string) {
    if (!Number.isInteger(delta) || delta === 0) return;
    setBusyVariant(variantId);
    setMessage("");
    const response = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, delta, reason }),
    });
    const data = await response.json().catch(() => ({}));
    setBusyVariant(null);
    if (!response.ok) {
      setMessage(data.error ?? "Voorraad kon niet worden aangepast.");
      return;
    }
    setMessage("Voorraad bijgewerkt.");
    router.refresh();
  }

  async function updateTarget(variantId: string, targetQuantity: number) {
    setBusyVariant(variantId);
    setMessage("");
    const response = await fetch("/api/admin/variants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, targetQuantity }),
    });
    const data = await response.json().catch(() => ({}));
    setBusyVariant(null);
    if (!response.ok) {
      setMessage(data.error ?? "Doelvoorraad kon niet worden aangepast.");
      return;
    }
    setMessage("Doelvoorraad bijgewerkt.");
    router.refresh();
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    window.location.assign("/admin/login");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-start justify-between gap-4 border-b border-[#1a1a1a] pb-8">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.25em] text-white/40">4THQRT</p>
            <h1 className="text-5xl font-black italic uppercase md:text-7xl" style={{ fontFamily: "var(--font-display)" }}>VOORRAAD</h1>
          </div>
          <button onClick={signOut} className="border border-[#2a2a2a] px-4 py-2 text-xs font-bold tracking-[0.15em] text-white/70 hover:border-white">UITLOGGEN</button>
        </div>

        {message && <p className="mb-6 border border-white/20 px-4 py-3 text-sm text-white/80">{message}</p>}
        {products.length === 0 ? (
          <p className="border border-[#1a1a1a] p-6 text-white/60">Nog geen producten. Voeg eerst producten en varianten toe in Supabase.</p>
        ) : products.map((product) => (
          <section key={product.id} className="mb-8 border border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] p-5">
              <div>
                <h2 className="text-lg font-bold uppercase">{product.name_nl}</h2>
                <p className="mt-1 text-xs tracking-[0.12em] text-white/40">/{product.slug} · {product.is_published ? "ZICHTBAAR" : "CONCEPT"}</p>
              </div>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {product.product_variants.map((variant) => {
                const fill = percentage(variant.available_quantity, variant.target_quantity);
                const busy = busyVariant === variant.id;
                return (
                  <div key={variant.id} className="grid gap-4 p-5 md:grid-cols-[1fr_180px_220px] md:items-center">
                    <div>
                      <p className="font-bold">{variant.color} · {variant.size}</p>
                      <p className="mt-1 text-xs tracking-wide text-white/40">{variant.sku} · €{(variant.price_cents / 100).toFixed(2)}</p>
                      <div className="mt-4 h-2 w-full max-w-md bg-white/10" aria-label={`Voorraad ${fill}%`}>
                        <div className="h-full bg-white transition-[width]" style={{ width: `${fill}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-white/60">{variant.available_quantity} beschikbaar · doel {variant.target_quantity} · {fill}%</p>
                    </div>
                    <label className="text-xs font-bold tracking-[0.12em] text-white/50">DOELVOORRAAD
                      <input type="number" min="0" defaultValue={variant.target_quantity} onBlur={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isInteger(next) && next !== variant.target_quantity) updateTarget(variant.id, next);
                      }} disabled={busy} className="mt-2" />
                    </label>
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => changeStock(variant.id, 1, "delivery")} className="flex-1 bg-white px-3 py-3 text-xs font-bold text-black disabled:opacity-40">+1</button>
                      <button disabled={busy} onClick={() => changeStock(variant.id, 5, "delivery")} className="flex-1 bg-white px-3 py-3 text-xs font-bold text-black disabled:opacity-40">+5</button>
                      <button disabled={busy || variant.available_quantity === 0} onClick={() => changeStock(variant.id, -1, "adjustment")} className="flex-1 border border-white/30 px-3 py-3 text-xs font-bold disabled:opacity-40">−1</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
