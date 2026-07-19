"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/lib/translations";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

type Country = "BE" | "NL";

const SHIPPING_COSTS: Record<Country, number> = { BE: 4.95, NL: 6.95 };
const FREE_SHIPPING_THRESHOLD = 75;

export default function CheckoutPage() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    postal: "",
    city: "",
    country: "BE" as Country,
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS[form.country];
  const total = subtotal + shippingCost;

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.firstName) newErrors.firstName = t.checkout.required;
    if (!form.lastName) newErrors.lastName = t.checkout.required;
    if (!form.email || !form.email.includes("@")) newErrors.email = t.checkout.required;
    if (!form.address) newErrors.address = t.checkout.required;
    if (!form.postal) newErrors.postal = t.checkout.required;
    if (!form.city) newErrors.city = t.checkout.required;
    if (!privacyAccepted) newErrors.privacy = t.checkout.required;
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerInfo: form,
          locale,
          shippingCost,
        }),
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert(locale === "nl" ? "Er is een fout opgetreden." : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-white/40 text-sm">{t.cart.empty}</p>
        <Link href="/shop" className="border-2 border-white text-white text-xs tracking-[0.25em] font-bold px-8 py-3 hover:bg-white hover:text-black transition-colors">
          {t.cart.empty_cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1
          className="text-5xl md:text-7xl text-white mb-12"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: "italic", fontWeight: 900, textTransform: "uppercase" }}
        >
          {t.checkout.title}
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form fields */}
            <div className="lg:col-span-2 space-y-10">
              {/* Personal */}
              <div>
                <h2 className="text-xs tracking-[0.2em] font-bold text-white/40 mb-6 uppercase">{t.checkout.personal}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName">{t.checkout.first_name}</label>
                    <input
                      id="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      autoComplete="given-name"
                    />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName">{t.checkout.last_name}</label>
                    <input
                      id="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      autoComplete="family-name"
                    />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="email">{t.checkout.email}</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <h2 className="text-xs tracking-[0.2em] font-bold text-white/40 mb-6 uppercase">{t.checkout.shipping_address}</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address">{t.checkout.address}</label>
                    <input
                      id="address"
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      autoComplete="street-address"
                    />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postal">{t.checkout.postal}</label>
                      <input
                        id="postal"
                        type="text"
                        value={form.postal}
                        onChange={(e) => setForm({ ...form, postal: e.target.value })}
                        autoComplete="postal-code"
                      />
                      {errors.postal && <p className="text-red-400 text-xs mt-1">{errors.postal}</p>}
                    </div>
                    <div>
                      <label htmlFor="city">{t.checkout.city}</label>
                      <input
                        id="city"
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        autoComplete="address-level2"
                      />
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country">{t.checkout.country}</label>
                    <select
                      id="country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value as Country })}
                      autoComplete="country"
                    >
                      <option value="BE">{t.checkout.belgium}</option>
                      <option value="NL">{t.checkout.netherlands}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="flex items-start gap-3">
                <input
                  id="privacy"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 flex-shrink-0"
                  style={{ width: "16px", padding: "0" }}
                />
                <label htmlFor="privacy" className="text-white/50 text-xs tracking-wide normal-case font-normal mb-0" style={{ fontSize: "12px" }}>
                  {t.checkout.privacy_agree}{" "}
                  <Link href="/privacy" className="text-white underline underline-offset-4">
                    {t.checkout.privacy_link}
                  </Link>
                  {errors.privacy && <span className="text-red-400 ml-2">{errors.privacy}</span>}
                </label>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 h-fit">
              <h2 className="text-xs tracking-[0.2em] font-bold text-white/40 mb-6 uppercase">{t.checkout.order_summary}</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{item.name}</p>
                      <p className="text-white/40 text-xs">{item.size} · {item.color} · ×{item.quantity}</p>
                    </div>
                    <p className="text-white text-xs font-bold flex-shrink-0">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1a1a1a] pt-4 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs">{t.cart.subtotal}</span>
                  <span className="text-white text-xs">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs">{locale === "nl" ? "Verzending" : "Shipping"}</span>
                  <span className="text-white text-xs">
                    {shippingCost === 0
                      ? locale === "nl" ? "GRATIS" : "FREE"
                      : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t border-[#1a1a1a] pt-4 mb-8">
                <span className="text-white text-xs tracking-[0.15em] font-bold uppercase">{t.checkout.total}</span>
                <span className="text-white text-lg font-bold">€{total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black text-xs tracking-[0.25em] font-bold py-4 hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? locale === "nl" ? "LADEN..." : "LOADING..."
                  : t.checkout.pay}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
