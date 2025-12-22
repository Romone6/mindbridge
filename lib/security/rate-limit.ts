/**
 * Simple in-memory rate limiter
 * In production, use Redis or Upstash for distributed rate limiting
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const store: RateLimitStore = new Map();

// Clean up expired entries every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (value.resetTime < now) {
            store.delete(key);
        }
    }
}, 60000);

export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const key = identifier;

    const record = store.get(key);

    if (!record || record.resetTime < now) {
        store.set(key, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: limit - 1, reset: now + windowMs };
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0, reset: record.resetTime };
    }

    record.count += 1;
    store.set(key, record);

    return {
        success: true,
        remaining: limit - record.count,
        reset: record.resetTime
    };
}
