import { v4 as uuid } from "uuid";

export function buildKey({
  scope, userId, resource, resourceId, category, ext
}) {
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
