import { PrismaClient } from "./generated/client/index.js";
import * as dotenv from "dotenv";
dotenv.config();

// Prevent multiple PrismaClient instances during Next.js hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prismaclient: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
