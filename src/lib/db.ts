import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Lazy singleton, same reason as getStripe() in src/lib/stripe.ts: Next.js
 * evaluates route modules during build-time page-data-collection, so a
 * client constructed eagerly at module scope would crash the build the
 * moment DATABASE_URL isn't yet set as an env var. Always add new
 * server-side API/DB clients this way, never `export const x = new Thing()`.
 */
let sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL!);
  }
  return sql;
}
