"use client";

import { useState } from "react";
import Image from "next/image";
import { DROP_TEXT } from "@/config";
import type { Locale } from "@/lib/translations";

type Stage = "email" | "key";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SendPlaneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

export default function DropMode({ locale }: { locale: Locale }) {
  const t = DROP_TEXT[locale] ?? DROP_TEXT.en;
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const trimmedEmail = email.trim();
  const canSendEmail = EMAIL_RE.test(trimmedEmail);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSendEmail || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/drop/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      if (!res.ok) throw new Error("send_failed");
      setStage("key");
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secretKey || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/drop/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: secretKey }),
      });
      if (!res.ok) {
        setError(t.keyError);
        return;
      }
      window.location.reload();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "flex-1 bg-transparent border border-white text-white placeholder-white/30 px-5 py-4 text-sm tracking-widest uppercase outline-none focus:bg-white/5 transition-colors";
  const buttonClass =
    "bg-white text-black px-5 py-4 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";
  const hiddenButtonClass =
    "pointer-events-none opacity-0 sm:w-0 sm:px-0 overflow-hidden border-0";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <Image
        src="/4th_wit.png"
        alt="4THQRT"
        width={160}
        height={60}
        className="object-contain mb-16"
        priority
      />

      <h1
        className="text-white font-bold italic uppercase leading-none mb-4"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.5rem, 10vw, 7rem)",
          letterSpacing: "0.04em",
          whiteSpace: "pre-line",
        }}
      >
        {t.heading}
      </h1>

      <p
        className="text-white/40 uppercase tracking-[0.3em] text-sm mb-12"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t.sub}
      </p>

      {stage === "email" ? (
        <>
          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col sm:flex-row gap-0 w-full max-w-md items-stretch"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              required
              className={inputClass}
              style={{ fontFamily: "var(--font-display)" }}
            />
            <button
              type="submit"
              disabled={!canSendEmail || busy}
              aria-hidden={!canSendEmail}
              className={buttonClass + " " + (canSendEmail ? "opacity-100" : hiddenButtonClass)}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="inline-flex items-center justify-center">
                <SendPlaneIcon />
              </span>
            </button>
          </form>
          {t.caption ? (
            <p
              className="text-white/40 uppercase tracking-[0.25em] text-xs mt-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.caption}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p
            className="text-white uppercase tracking-[0.25em] text-sm mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.sent}
          </p>
          <form
            onSubmit={handleKeySubmit}
            className="flex flex-col sm:flex-row gap-0 w-full max-w-md"
          >
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder={t.keyPlaceholder}
              required
              autoFocus
              className={inputClass}
              style={{ fontFamily: "var(--font-display)" }}
            />
            <button
              type="submit"
              disabled={busy}
              className={buttonClass}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.keyCta}
            </button>
          </form>
        </>
      )}

      {error && (
        <p
          className="text-white/70 uppercase tracking-[0.25em] text-xs mt-6 border border-white/30 px-6 py-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}