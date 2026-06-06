import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { PrismaClient } from "../api/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const url = new URL(connectionString);
const pool = new Pool({
  host: url.hostname,
  port: Number(url.port) || 5432,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  console.log("Users in database:");
  for (const u of users) {
    const testPasswords = ["admin123", "buyer123", "vendor123", "password123"];
    for (const pw of testPasswords) {
      const match = await bcrypt.compare(pw, u.passwordHash);
      if (match) {
        console.log(`  ${u.email} (${u.role}) -> password: ${pw}`);
        break;
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
