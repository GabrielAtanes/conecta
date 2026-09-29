import "server-only";

import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está configurada.");
  }

  globalForPostgres.postgresPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

  return globalForPostgres.postgresPool;
}