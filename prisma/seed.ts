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

  // Sample Food Requests
  const request1 = await prisma.foodRequest.create({
    data: {
      buyerId: buyer.id,
      foodName: "Party Jollof & Fried Chicken",
      category: "Nigerian",
      quantity: 1,
      unit: "Pot",
      budgetMin: 25000,
      budgetMax: 35000,
      deliveryAddress: "15 Admiralty Way, Lekki",
      deliveryDateTime: new Date(Date.now() + 86400000),
      instructions: "Low pepper, serves 25 people",
      status: "bidding",
    },
  });

  const request2 = await prisma.foodRequest.create({
    data: {
      buyerId: buyer.id,
      foodName: "Vegetarian Soup Pack",
      category: "Soups",
      quantity: 8,
      unit: "Portion",
      budgetMin: 8000,
      budgetMax: 12000,
      deliveryAddress: "22 Bourdillon Rd, Ikoyi",
      deliveryDateTime: new Date(Date.now() + 172800000),
      instructions: "No meat, extra ugwu leaves",
      status: "bidding",
    },
  });

  const request3 = await prisma.foodRequest.create({
    data: {
      buyerId: buyer.id,
      foodName: "Office Lunch Bowls",
      category: "Healthy",
      quantity: 15,
      unit: "Bowl",
      budgetMin: 15000,
      budgetMax: 26000,
      deliveryAddress: "Eko Atlantic, Victoria Island",
      deliveryDateTime: new Date(Date.now() - 86400000),
      instructions: "Contact reception on arrival",
      status: "completed",
    },
  });

  console.log("Created requests:", request1.id, request2.id, request3.id);

  // Sample Bids
  const bid1 = await prisma.bid.create({
    data: {
      requestId: request1.id,
      vendorId: vendor1.id,
      bidAmount: 30500,
      prepTimeMinutes: 120,
      estimatedDeliveryTime: "Ready by 5PM",
      message: "Fresh ingredients, serves 25 people comfortably",
      status: "active",
    },
  });

  const bid2 = await prisma.bid.create({
    data: {
      requestId: request1.id,
      vendorId: vendor2.id,
      bidAmount: 31500,
      prepTimeMinutes: 135,
      estimatedDeliveryTime: "Ready by 5:15PM",
      message: "Premium chicken cuts included",
      status: "active",
    },
  });

  const bid3 = await prisma.bid.create({
    data: {
      requestId: request2.id,
      vendorId: vendor1.id,
      bidAmount: 11000,
      prepTimeMinutes: 90,
      estimatedDeliveryTime: "Tomorrow 10AM",
      message: "Farm-fresh vegetables, no preservatives",
      status: "active",
    },
  });

  console.log("Created bids:", bid1.id, bid2.id, bid3.id);

  // Sample Order
  const order = await prisma.order.create({
    data: {
      requestId: request3.id,
      buyerId: buyer.id,
      vendorId: vendor2.id,
      bidId: "BID-OLD",
      foodCost: 22000,
      deliveryFee: 2000,
      platformFee: 500,
      escrowFee: 300,
      totalAmount: 24800,
      status: "completed",
      deliveredAt: new Date(Date.now() - 3600000),
    },
  });
  console.log("Created order:", order.id);

  // Vendor Wallets
  await prisma.escrowWallet.create({
    data: {
      vendorId: vendor1.id,
      available: 45200,
      pending: 23800,
      totalEarned: 125600,
      currency: "NGN",
    },
  });

  await prisma.escrowWallet.create({
    data: {
      vendorId: vendor2.id,
      available: 28100,
      pending: 15000,
      totalEarned: 89300,
      currency: "NGN",
    },
  });

  console.log("Created escrow wallets");

  // Menu Items
  const vendor1Profile = await prisma.vendorProfile.findUnique({
    where: { userId: vendor1.id },
  });

  if (vendor1Profile) {
    await prisma.menuItem.createMany({
      data: [
        {
          vendorId: vendor1Profile.id,
          name: "Egusi Soup (Full Pot)",
          description: "Rich melon seed soup with assorted meat and fish",
          price: 15000,
          category: "Soups",
        },
        {
          vendorId: vendor1Profile.id,
          name: "Okra Soup (Full Pot)",
          description: "Fresh okra with seafood blend",
          price: 14000,
          category: "Soups",
        },
      ],
    });
  }

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
