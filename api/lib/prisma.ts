import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaNeonHttp(connectionString, {});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
