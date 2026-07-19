"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = hasSupabasePublicConfig();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured || loading) return;
    setLoading(true);
    setError("");

    const { error: loginError } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (loginError) {
      setError("Inloggen is niet gelukt.");
      setLoading(false);
      return;
    }

    window.location.assign("/admin");
  }

  const initialError = searchParams.get("error");
  const message = error || (initialError === "configuration"
    ? "Supabase is nog niet geconfigureerd."
    : initialError === "forbidden"
      ? "Dit account heeft geen adminrechten."
      : "");

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white">
      <div className="mx-auto w-full max-w-md border border-[#1a1a1a] bg-[#0a0a0a] p-8">
        <p className="mb-3 text-xs font-bold tracking-[0.25em] text-white/40">4THQRT</p>
        <h1 className="mb-8 text-5xl font-black italic uppercase" style={{ fontFamily: "var(--font-display)" }}>ADMIN</h1>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!configured} />
          </div>
          <div>
            <label htmlFor="password">Wachtwoord</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!configured} />
          </div>
          {message && <p className="text-sm text-red-300">{message}</p>}
          <button type="submit" disabled={!configured || loading} className="w-full bg-white py-4 text-xs font-bold tracking-[0.22em] text-black disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? "LADEN..." : "INLOGGEN"}
          </button>
        </form>
      </div>
    </main>
  );
}
