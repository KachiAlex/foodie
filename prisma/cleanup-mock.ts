import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);

const KEEP_EMAILS = ["admin@foodiemarket.com", "opd.livmind@gmail.com"];
const DEMO_PATTERN = "demo-vendor-%@foodie.local";

async function main() {
  const usersToRemove = (await sql`
    SELECT id, email, name, role FROM users
    WHERE email <> ALL(${KEEP_EMAILS})
      AND email NOT LIKE ${DEMO_PATTERN}
    ORDER BY email
  `) as { id: string; email: string; name: string; role: string }[];

  if (usersToRemove.length === 0) {
    console.log("No mock users to remove.");
    return;
  }

  console.log(`Removing ${usersToRemove.length} mock user(s):`);
  usersToRemove.forEach((u) => console.log(` - ${u.email} (${u.name}, ${u.role})`));

  for (const user of usersToRemove) {
    const uid = user.id;

    await sql`UPDATE orders SET "riderId" = NULL WHERE "riderId" = ${uid}`;
    await sql`DELETE FROM vendor_market_offers WHERE "buyerId" = ${uid} OR "vendorId" = ${uid}`;
    await sql`DELETE FROM disputes WHERE "openedById" = ${uid}`;
    await sql`DELETE FROM notifications WHERE "userId" = ${uid}`;
    await sql`DELETE FROM escrow_transactions WHERE "vendorId" = ${uid}`;
    await sql`DELETE FROM escrow_wallets WHERE "vendorId" = ${uid}`;
    await sql`DELETE FROM orders WHERE "buyerId" = ${uid} OR "vendorId" = ${uid}`;
    await sql`DELETE FROM bids WHERE "vendorId" = ${uid}`;
    await sql`DELETE FROM food_requests WHERE "buyerId" = ${uid}`;
    await sql`DELETE FROM menu_items WHERE "vendorId" IN (SELECT id FROM vendor_profiles WHERE "userId" = ${uid})`;
    await sql`DELETE FROM vendor_documents WHERE "vendorId" IN (SELECT id FROM vendor_profiles WHERE "userId" = ${uid})`;
    await sql`DELETE FROM vendor_profiles WHERE "userId" = ${uid}`;
    await sql`DELETE FROM users WHERE id = ${uid}`;
  }

  console.log("Cleanup complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
