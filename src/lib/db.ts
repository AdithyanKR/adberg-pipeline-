import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

let prisma: PrismaClient | null = null;
let isDbConnected = false;

try {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("johndoe") || connectionString.includes("randompassword")) {
    console.warn("DATABASE_URL is not configured with real credentials. Running in mock/fallback mode.");
  } else {
    // Attempt database driver initialization
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000, // Quick timeout so the app doesn't hang
    });
    
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    isDbConnected = true;
    console.log("Database driver initialized successfully.");
  }
} catch (error) {
  console.error("Failed to initialize database driver:", error);
  prisma = null;
  isDbConnected = false;
}

export { prisma, isDbConnected };
export type { PrismaClient };
