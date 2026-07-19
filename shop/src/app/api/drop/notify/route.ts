import { enforceRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function keyEmailHtml(secretKey: string) {
  return `
  <div style="background:#000;padding:48px 24px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
    <p style="color:#fff;font-size:28px;font-weight:bold;font-style:italic;letter-spacing:2px;margin:0 0 40px;">4THQRT</p>
    <p style="color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px;">Your secret key</p>
    <p style="color:#fff;font-size:40px;font-weight:bold;font-style:italic;letter-spacing:6px;margin:0 0 40px;">${secretKey}</p>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:1px;margin:0;">Enter this key on the site to unlock the drop.</p>
  </div>`;
}

export async function POST(request: Request) {
  const limit = await enforceRateLimit(request, "drop-notify", 3, 60 * 60);
  if (!limit.allowed) {
    return Response.json({ ok: false, error: "try_later" }, { status: limit.reason === "limited" ? 429 : 503 });
  }

  let email: unknown;
  try { ({ email } = await request.json()); } catch { return Response.json({ ok: false, error: "invalid_body" }, { status: 400 }); }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DROP_FROM_EMAIL ?? "4THQRT <onboarding@resend.dev>";
  const secretKey = process.env.DROP_SECRET_KEY ?? (process.env.NODE_ENV !== "production" ? "4THQRT" : undefined);
  if (!secretKey) return Response.json({ ok: false, error: "configuration" }, { status: 503 });

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") return Response.json({ ok: false, error: "configuration" }, { status: 503 });
    return Response.json({ ok: true, demo: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email.trim()], subject: "Your secret key — 4THQRT", html: keyEmailHtml(secretKey) }),
  });

  if (!res.ok) {
    console.error(`[drop] Resend fout ${res.status}: ${await res.text()}`);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}