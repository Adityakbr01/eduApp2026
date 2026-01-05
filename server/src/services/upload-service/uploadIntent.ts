import { redis } from "src/configs/redis.js";
import { v4 as uuid } from "uuid";

export async function createIntent(userId, key, size, mime) {
  const intent = {
    id: uuid(),
    userId,
    key,
    size,
    mime,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  await redis.set(
    `upload:intent:${intent.id}`,
    JSON.stringify(intent),
    "PX",
    300000
  );

  return intent;
}
