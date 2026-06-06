import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  // eslint-disable-next-line no-console
  console.log("[prisma] DATABASE_URL present?", !!url, "length:", url?.length);
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please configure it in your Vercel project settings (Environment Variables)."
    );
  }
  neonConfig.connectionString = url;
  const pool = new Pool();
  const adapter = new PrismaNeon(pool as unknown as ConstructorParameters<typeof PrismaNeon>[0]);
  return new PrismaClient({ adapter });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalForPrisma.prisma as any)[prop];
  },
});
