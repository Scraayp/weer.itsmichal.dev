import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  const client = createPool(env.DATABASE_URL);

  return drizzle({
    client,
    relations,
  });
}

export type Database = ReturnType<typeof createDb>;
