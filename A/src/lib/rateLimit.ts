/**
 * In-Memory Sliding Window Rate Limiter
 * Protejează endpoint-urile publice și administrative împotriva atacurilor de tip DoS și brute-force.
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

// Curățare periodică la fiecare 10 minute pentru evitarea scurgerilor de memorie
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);

  if (typeof timer === "object" && timer !== null && "unref" in timer && typeof (timer as { unref: () => void }).unref === "function") {
    (timer as { unref: () => void }).unref();
  }
}

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetInMs: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
