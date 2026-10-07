/** JSON-safe conversion for BigInt and Date fields from Prisma */
export function serialize<T = unknown>(value: unknown): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? v.toString() : v)),
  ) as T;
}
