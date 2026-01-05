import { redis } from "src/configs/redis.js";

export async function checkUploadRate(userId: string) {
  const key = `upload:rate:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 600); // 10 min
  }

  if (count > 10) {
    throw new Error("Upload rate limit exceeded");
  }
}
