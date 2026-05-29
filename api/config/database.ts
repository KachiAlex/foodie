// TODO: replace with Prisma + PostgreSQL connection
// import { PrismaClient } from "@prisma/client";
// export const prisma = new PrismaClient();

// In-memory store for MVP
export const db = {
  users: new Map<string, any>(),
  requests: new Map<string, any>(),
  bids: new Map<string, any>(),
  orders: new Map<string, any>(),
  wallets: new Map<string, any>(),
  transactions: new Map<string, any>(),
};
