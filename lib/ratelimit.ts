import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

export type LimitResult =
  | { ok: true }
  | { ok: false; response: Response };

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip ?? req.headers.get("x-real-ip") ?? "unknown";
}

const redisConfigured =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let postLimit: Ratelimit | null = null;
let getLimit: Ratelimit | null = null;

if (redisConfigured) {
  const redis = Redis.fromEnv();
  postLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    prefix: "hedwig:secret:post",
  });
  getLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "hedwig:secret:get",
  });
}

export async function limitPostCreate(
  req: NextRequest
): Promise<LimitResult> {
  if (!postLimit) return { ok: true };
  const ip = getClientIp(req);
  const { success } = await postLimit.limit(ip);
  if (success) return { ok: true };
  return {
    ok: false,
    response: new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    }),
  };
}

export async function limitSecretGet(req: NextRequest): Promise<LimitResult> {
  if (!getLimit) return { ok: true };
  const ip = getClientIp(req);
  const { success } = await getLimit.limit(ip);
  if (success) return { ok: true };
  return {
    ok: false,
    response: new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    }),
  };
}
