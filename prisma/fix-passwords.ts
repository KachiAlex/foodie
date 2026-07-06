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

async function fix() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const plain = user.passwordHash;
    if (plain.length < 20) {
      const hash = await bcrypt.hash(plain, 10);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
      console.log(`Updated ${user.email}: ${plain} -> bcrypt hash`);
    } else {
      console.log(`Skipped ${user.email}: already hashed`);
    }
  }
  await pool.end();
  process.exit(0);
}

fix().catch((err) => { console.error(err); process.exit(1); });
