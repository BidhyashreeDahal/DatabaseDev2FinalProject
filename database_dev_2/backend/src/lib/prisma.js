import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from '../../generated/prisma/client';

let prismaSingleton = null;

export function createPrismaClient() {
  if (prismaSingleton) {
    return prismaSingleton;
  }

  const rawConnectionString = String(process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();
  const connectionString = rawConnectionString.replace(/^["']|["']$/g, "");

  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL is missing from .env");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prismaSingleton = new PrismaClient({ adapter });
  return prismaSingleton;
}
