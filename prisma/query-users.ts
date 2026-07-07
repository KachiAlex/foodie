import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const users = (await sql`
    SELECT id, email, name, role, "verificationStatus"
    FROM users
    WHERE email = ${"opd.livmind@gmail.com"}
    ORDER BY email
  `) as { id: string; email: string; name: string; role: string; verificationStatus: string }[];

  console.log("Matching users:");
  users.forEach((u) => console.log(` - ${u.email} (${u.name}, ${u.role}, ${u.verificationStatus})`));

  const all = (await sql`SELECT id, email, name, role FROM users ORDER BY "createdAt" DESC LIMIT 20`) as {
    id: string; email: string; name: string; role: string;
  }[];
  console.log("\nRecent users:");
  all.forEach((u) => console.log(` - ${u.email} (${u.name}, ${u.role})`));
}

main().catch((e) => { console.error(e); process.exit(1); });
