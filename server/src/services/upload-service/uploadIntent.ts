import { redis } from "src/configs/redis.js";
import { v4 as uuid } from "uuid";


export interface UploadIntent {
  id: string;
  userId: string;
  key: string;
  size: number;
  mime: string;
  expiresAt: number;
}



export async function createIntent(
  userId: string,
  key: string,
  size: number,
  mime: string,
) {
  const intent = {
    id: uuid(),
    userId,
    key,
    size,
    mime,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  await redis.set(
    `upload:intent:${intent.id}`,
    JSON.stringify(intent),
    "PX",
    300000
  );

  return intent;
}


