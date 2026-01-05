import { v4 as uuid } from "uuid";

export interface BuildKeyOptions {
  scope: string;
  userId: string;
  resource: string;
  resourceId?: string | null;
  category: string;
  ext: string;
}

export function buildKey({
  scope,
  userId,
  resource,
  resourceId,
  category,
  ext
}: BuildKeyOptions): string {
  return [
    "prod",
    scope,
    userId,
    resource,
    resourceId,
    category,
    `${uuid()}.${ext}`
  ].filter(Boolean).join("/");
}
