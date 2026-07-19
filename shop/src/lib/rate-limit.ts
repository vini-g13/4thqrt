import { createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; reason: "limited" | "unavailable" };

const developmentBuckets = new Map<string, { count: number; startedAt: number }>();

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function hashIdentifier(value: string) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("hex");
}

function consumeDevelopmentBucket(
  scope: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const key = `${scope}:${identifier}`;
  const now = Date.now();
  const current = developmentBuckets.get(key);
  const windowMs = windowSeconds * 1000;

  if (!current || now - current.startedAt >= windowMs) {
    developmentBuckets.set(key, { count: 1, startedAt: now });
    return { allowed: true };
  }

  current.count += 1;
  if (current.count <= maxRequests) return { allowed: true };
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - current.startedAt)) / 1000)),
    reason: "limited",
  };
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const address = getClientAddress(request);
  const identifier = hashIdentifier(address);
  const supabase = createSupabaseAdminClient();

  if (!supabase || !identifier) {
    if (process.env.NODE_ENV !== "production") {
      return consumeDevelopmentBucket(scope, address, maxRequests, windowSeconds);
    }
    return { allowed: false, retryAfterSeconds: 0, reason: "unavailable" };
  }

  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_scope: scope,
    p_identifier_hash: identifier,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return { allowed: false, retryAfterSeconds: 0, reason: "unavailable" };
  if (row.allowed) return { allowed: true };

  return {
    allowed: false,
    retryAfterSeconds: Number(row.retry_after_seconds) || windowSeconds,
    reason: "limited",
  };
}
