import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const profile = (await sql`
    SELECT id, "userId", "kitchenName", verified, rating, "totalOrders"
    FROM vendor_profiles
    WHERE "userId" = (SELECT id FROM users WHERE email = ${"opd.livmind@gmail.com"})
  `) as { id: string; userId: string; kitchenName: string; verified: boolean; rating: number; totalOrders: number }[];

  console.log("Profile:", profile);

  const items = (await sql`
    SELECT id, name, price, category, "imageUrl"
    FROM menu_items
    WHERE "vendorId" = ${profile.length ? profile[0].id : null}
  `) as { id: string; name: string; price: number; category: string; imageUrl: string | null }[];

  console.log("Menu items:", items);
}

main().catch((e) => { console.error(e); process.exit(1); });
