import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.STORAGE_POSTGRES_URL;

// In serverless environments, neon-http client provides HTTP-based pooled queries
export const sql = databaseUrl ? neon(databaseUrl) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

export { schema };

