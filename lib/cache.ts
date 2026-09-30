import { redis } from "@/lib/redis";

const PREFIX = process.env.REDIS_KEY_PREFIX || "pla";

export const CacheKeys = {
  workflow: `${PREFIX}:cache:workflow`,
  gallery: `${PREFIX}:cache:gallery`,
  settings: `${PREFIX}:cache:settings:v2`,
  posts: (type: string) => `${PREFIX}:cache:posts:${type}`,
  post: (slug: string) => `${PREFIX}:cache:post:${slug}`,
  rateContact: (ip: string) => `${PREFIX}:ratelimit:contact:${ip}`,
} as const;

const DEFAULT_TTL = Number(process.env.REDIS_CACHE_TTL || 300); // 5 phút

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return (await redis.get<T>(key)) ?? null;
  } catch (error) {
    console.error("[cache:get]", key, error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("[cache:set]", key, error);
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (error) {
    console.error("[cache:del]", keys, error);
  }
}

/** Get-or-set pattern — đọc Redis trước, miss thì fetch DB rồi ghi cache */
export async function cacheRemember<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

/** Xoá toàn bộ cache public CMS sau khi admin sửa nội dung */
export async function invalidateCmsCache(slugs: string[] = []) {
  const keys = [
    CacheKeys.workflow,
    CacheKeys.gallery,
    CacheKeys.settings,
    CacheKeys.posts("COURSE"),
    CacheKeys.posts("ONLINE"),
    CacheKeys.posts("EVENT"),
    CacheKeys.posts("BLOG"),
    ...slugs.map((s) => CacheKeys.post(s)),
  ];
  await cacheDel(...keys);
}

/**
 * Rate limit đơn giản bằng Redis INCR + EXPIRE.
 * Trả về { ok, remaining } — nếu vượt limit thì ok=false.
 */
export async function rateLimit(
  key: string,
  limit = 5,
  windowSeconds = 60,
): Promise<{ ok: boolean; remaining: number; count: number }> {
  if (!redis) {
    return { ok: true, remaining: limit, count: 0 };
  }

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const remaining = Math.max(0, limit - count);
    return { ok: count <= limit, remaining, count };
  } catch (error) {
    console.error("[rateLimit]", key, error);
    return { ok: true, remaining: limit, count: 0 };
  }
}
