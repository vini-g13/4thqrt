import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await enforceRateLimit(request, "drop-validate", 30, 15 * 60);
  if (!limit.allowed) return Response.json({ ok: false }, { status: limit.reason === "limited" ? 429 : 503 });

  let key: unknown;
  try { ({ key } = await request.json()); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const secretKey = process.env.DROP_SECRET_KEY ?? (process.env.NODE_ENV !== "production" ? "4THQRT" : undefined);
  if (!secretKey) return Response.json({ ok: false }, { status: 503 });
  if (typeof key !== "string" || key.trim().toUpperCase() !== secretKey.toUpperCase()) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json({ ok: true });
}