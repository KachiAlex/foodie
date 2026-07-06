import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { PrismaClient } from "../api/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

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
  console.log("Seeding database...");

  const adminPass = await bcrypt.hash("admin123", 10);
  const buyerPass = await bcrypt.hash("buyer123", 10);
  const vendorPass = await bcrypt.hash("vendor123", 10);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@foodiemarket.com",
      name: "Marketplace Admin",
      passwordHash: adminPass,
      role: "admin",
      verificationStatus: "verified",
    },
  });
  console.log("Created admin:", admin.email);

  // Buyer user
  const buyer = await prisma.user.create({
    data: {
      email: "buyer@foodiemarket.com",
      name: "Chinedu Okonkwo",
      passwordHash: buyerPass,
      role: "buyer",
      verificationStatus: "verified",
    },
  });
  console.log("Created buyer:", buyer.email);

  // Vendor users with profiles
  const vendor1 = await prisma.user.create({
    data: {
      email: "chef.nneka@foodiemarket.com",
      name: "Chef Nneka",
      passwordHash: vendorPass,
      role: "vendor",
      verificationStatus: "verified",
      vendorProfile: {
        create: {
          kitchenName: "Nneka's Kitchen",
          streetAddress: "12 Lekki Phase 1",
          city: "Lagos",
          state: "Lagos",
          landmark: "Near Silverbird Cinema",
          specialties: ["Nigerian", "Soups"],
          rating: 4.8,
          totalOrders: 145,
          isOnline: true,
          verified: true,
        },
      },
    },
  });
  console.log("Created vendor:", vendor1.email);

  const vendor2 = await prisma.user.create({
    data: {
      email: "chef.tunde@foodiemarket.com",
      name: "Chef Tunde",
      passwordHash: vendorPass,
      role: "vendor",
      verificationStatus: "verified",
      vendorProfile: {
        create: {
          kitchenName: "Tunde's Grills",
          streetAddress: "45 Ikeja GRA",
          city: "Lagos",
          state: "Lagos",
          landmark: "Opposite GTBank",
          specialties: ["Grills", "Rice Dishes"],
          rating: 4.5,
          totalOrders: 89,
          isOnline: true,
          verified: true,
        },
      },
    },
  });
  console.log("Created vendor:", vendor2.email);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
