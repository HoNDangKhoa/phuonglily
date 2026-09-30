import { Redis } from "@upstash/redis";

/**
 * Upstash Redis — chuẩn trên Vercel (HTTP REST, không cần TCP persistent).
 * Local: tạo free DB tại https://console.upstash.com rồi dán URL/TOKEN vào .env
 */
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function createRedis(): Redis | null {
  // Vercel Upstash marketplace injects KV_REST_API_*; local/manual uses UPSTASH_*
  const rawUrl =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const rawToken =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  const url = rawUrl.trim();
  const token = rawToken.trim();

  if (!url.startsWith("https://") || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[redis] Missing valid KV_REST_API_* / UPSTASH_REDIS_REST_* — cache disabled",
      );
    }
    return null;
  }

  return new Redis({ url, token });
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export function isRedisEnabled() {
  return !!redis;
}
