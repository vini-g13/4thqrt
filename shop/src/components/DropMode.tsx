"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DROP_TEXT } from "@/config";
import type { Locale } from "@/lib/translations";

type Stage = "email" | "key";
type KeyStatus = "idle" | "checking" | "invalid" | "valid";

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

function LockClosedIcon() {
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
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function LockOpenIcon() {
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
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.2-2.4" />
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
  const [keyStatus, setKeyStatus] = useState<KeyStatus>("idle");
  const requestIdRef = useRef(0);

  const trimmedEmail = email.trim();
  const canSendEmail = EMAIL_RE.test(trimmedEmail);
  const trimmedKey = secretKey.trim();
  const hasKeyInput = trimmedKey.length > 0;
  const keyVerified = keyStatus === "valid";

  useEffect(() => {
    if (stage !== "key") return;

    if (!trimmedKey) {
      setKeyStatus("idle");
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(async () => {
      setKeyStatus("checking");
      try {
        const res = await fetch("/api/drop/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: trimmedKey }),
        });

        if (requestId !== requestIdRef.current) return;
        setKeyStatus(res.ok ? "valid" : "invalid");
      } catch {
        if (requestId !== requestIdRef.current) return;
        setKeyStatus("idle");
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [stage, trimmedKey]);

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
      setSecretKey("");
      setKeyStatus("idle");
      setStage("key");
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !keyVerified) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/drop/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmedKey }),
      });
      if (!res.ok) {
        setError(t.keyError);
        setKeyStatus("invalid");
        return;
      }
      window.location.reload();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  function handleSecretKeyChange(value: string) {
    setSecretKey(value);
    if (error) setError("");
  }

  const inputClass =
    "min-w-0 flex-1 bg-transparent text-white px-5 py-4 text-sm tracking-[0.28em] uppercase outline-none";
  const buttonBaseClass =
    "flex h-[54px] shrink-0 items-center justify-center self-stretch bg-white text-black border-l border-black/15 transition-all duration-200";
  const emailButtonVisibleClass = canSendEmail
    ? "w-[54px] opacity-100 cursor-pointer"
    : "pointer-events-none w-0 overflow-hidden opacity-0";
  const keyButtonStateClass = keyVerified
    ? "w-[54px] opacity-100 cursor-pointer"
    : "w-[54px] opacity-55 cursor-not-allowed";
  const shellClass =
    "mx-auto flex w-full max-w-[30rem] items-stretch overflow-hidden border border-white/85 bg-white/[0.03]";
  const helperTextClass =
    "mx-auto mt-5 max-w-[22rem] text-[11px] uppercase leading-relaxed tracking-[0.22em] text-white/42";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "min(24vw, 120px) min(24vw, 120px)",
          maskImage: "radial-gradient(circle at center, black 35%, transparent 78%)",
        }}
      />

      <Image
        src="/4th_wit.png"
        alt="4THQRT"
        width={160}
        height={60}
        className="mb-14 h-auto object-contain sm:mb-16"
        priority
      />

      <h1
        className="mb-4 text-white font-bold italic uppercase leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.8rem, 10vw, 7rem)",
          letterSpacing: "0.035em",
          whiteSpace: "pre-line",
        }}
      >
        {t.heading}
      </h1>

      <p
        className="mb-12 text-sm uppercase tracking-[0.3em] text-white/40"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t.sub}
      </p>

      {stage === "email" ? (
        <>
          <form onSubmit={handleEmailSubmit} className={shellClass}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              style={{ fontFamily: "var(--font-display)" }}
              aria-label="Email"
            />
            <button
              type="submit"
              disabled={!canSendEmail || busy}
              aria-hidden={!canSendEmail}
              aria-label="Send email"
              className={`${buttonBaseClass} ${emailButtonVisibleClass}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <SendPlaneIcon />
            </button>
          </form>
          <p className={helperTextClass} style={{ fontFamily: "var(--font-display)" }}>
            {t.caption}
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleKeySubmit} className={shellClass}>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => handleSecretKeyChange(e.target.value)}
              required
              autoFocus
              className={inputClass}
              style={{ fontFamily: "var(--font-display)" }}
              aria-label="Secret key"
            />
            <button
              type="submit"
              disabled={busy || !keyVerified}
              aria-label={keyVerified ? "Open lock" : "Check secret key"}
              className={`${buttonBaseClass} ${keyButtonStateClass}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {keyVerified ? <LockOpenIcon /> : <LockClosedIcon />}
            </button>
          </form>
          <p className={helperTextClass} style={{ fontFamily: "var(--font-display)" }}>
            {t.sent}
          </p>
        </>
      )}

      {error && (
        <p
          className="mt-6 border border-white/30 bg-white/[0.03] px-6 py-3 text-xs uppercase tracking-[0.22em] text-white/70"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
