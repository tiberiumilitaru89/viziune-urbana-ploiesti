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

/**
 * Rate limiter distribuit hibrid (Upstash Redis / Vercel KV REST API + Fallback In-Memory)
 * Asigură persistența limitării între instanțele Serverless concurente.
 */
export async function checkRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const kvUrl = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();
  const kvToken = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();

  if (kvUrl && kvToken) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      const redisKey = `vup:rl:${key}`;
      const res = await fetch(`${kvUrl.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        signal: AbortSignal.timeout(1500),
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds, "NX"],
          ["PTTL", redisKey],
        ]),
      });

      if (res.ok) {
        const data = (await res.json()) as Array<{ result?: number }>;
        const currentCount = Number(data?.[0]?.result ?? 1);
        const pttl = Number(data?.[2]?.result ?? windowMs);
        const resetInMs = pttl > 0 ? pttl : windowMs;

        if (currentCount > limit) {
          store.set(key, { count: currentCount, resetAt: Date.now() + resetInMs });
          return {
            allowed: false,
            remaining: 0,
            resetInMs,
          };
        }

        store.set(key, { count: currentCount, resetAt: Date.now() + resetInMs });
        return {
          allowed: true,
          remaining: Math.max(0, limit - currentCount),
          resetInMs,
        };
      }
    } catch {
      // Fallback determinist la store-ul din memorie dacă KV nu răspunde în 1.5s
    }
  }

  return checkRateLimit(key, limit, windowMs);
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
