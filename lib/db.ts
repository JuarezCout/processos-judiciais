import { PrismaClient } from "@prisma/client";
import { mockDb } from "./mock-db";

const isMock = !process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrisma() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const realPrisma = isMock ? null : (globalForPrisma.prisma ?? createPrisma());

if (realPrisma && process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = realPrisma;

export const prisma = (isMock ? mockDb : realPrisma) as unknown as PrismaClient;
