import { prisma } from "../lib/prisma";

interface CuisineAffinities {
  [cuisine: string]: number;
}

/**
 * Updates or creates a buyer's preference profile based on their order history.
 * Called after order completion or review submission.
 */
export async function updateBuyerPreferences(buyerId: string) {
  const orders = await prisma.order.findMany({
    where: { buyerId, status: { in: ["completed", "delivered"] } },
    include: {
      request: { select: { category: true, budgetMin: true, budgetMax: true, quantity: true, unit: true } },
      review: { select: { rating: true, comment: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) return;

  const cuisineScores: CuisineAffinities = {};
  let totalBudgetMin = 0;
  let totalBudgetMax = 0;
  let validBudgetCount = 0;

  for (const order of orders) {
    const category = order.request.category.toLowerCase();
    const rating = order.review?.rating ?? 3;

    // Weight cuisine by review rating (unreviewed = neutral 3)
    const weight = rating >= 4 ? 1.5 : rating <= 2 ? 0.3 : 1.0;
    cuisineScores[category] = (cuisineScores[category] || 0) + weight;

    if (order.request.budgetMin && order.request.budgetMax) {
      totalBudgetMin += Number(order.request.budgetMin);
      totalBudgetMax += Number(order.request.budgetMax);
      validBudgetCount++;
    }
  }

  // Normalize cuisine affinities to 0-1 range
  const maxScore = Math.max(...Object.values(cuisineScores), 1);
  const normalized: CuisineAffinities = {};
  for (const [cuisine, score] of Object.entries(cuisineScores)) {
    normalized[cuisine] = Math.round((score / maxScore) * 100) / 100;
  }

  // Sort by score descending and keep top 10
  const sorted = Object.entries(normalized)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  const topCuisines: CuisineAffinities = {};
  for (const [cuisine, score] of sorted) {
    topCuisines[cuisine] = score;
  }

  const avgBudgetMin = validBudgetCount > 0 ? totalBudgetMin / validBudgetCount : 0;
  const avgBudgetMax = validBudgetCount > 0 ? totalBudgetMax / validBudgetCount : 0;

  await prisma.buyerPreference.upsert({
    where: { buyerId },
    create: {
      buyerId,
      cuisineAffinities: topCuisines as any,
      avgBudgetMin,
      avgBudgetMax,
      totalOrders: orders.length,
    },
    update: {
      cuisineAffinities: topCuisines as any,
      avgBudgetMin,
      avgBudgetMax,
      totalOrders: orders.length,
    },
  });
}

/**
 * Calculates a taste match score (0-100) between a buyer and a vendor.
 */
export async function calculateMatchScore(buyerId: string, vendorId: string): Promise<number> {
  const [preferences, vendor] = await Promise.all([
    prisma.buyerPreference.findUnique({ where: { buyerId } }),
    prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { specialties: true, rating: true, menuItems: { select: { category: true } } },
    }),
  ]);

  if (!preferences || !vendor) return 50; // Neutral default

  const affinities = preferences.cuisineAffinities as CuisineAffinities;
  if (!affinities || Object.keys(affinities).length === 0) return 50;

  // Score based on vendor specialties matching buyer affinities
  let specialtyScore = 0;
  let specialtyCount = 0;
  for (const spec of vendor.specialties) {
    const normalized = spec.toLowerCase();
    if (affinities[normalized] !== undefined) {
      specialtyScore += affinities[normalized];
      specialtyCount++;
    }
  }

  // Score based on menu item categories matching buyer affinities
  let menuScore = 0;
  let menuCount = 0;
  for (const item of vendor.menuItems) {
    const normalized = item.category.toLowerCase();
    if (affinities[normalized] !== undefined) {
      menuScore += affinities[normalized];
      menuCount++;
    }
  }

  // Combined score
  const specialtyAvg = specialtyCount > 0 ? specialtyScore / specialtyCount : 0;
  const menuAvg = menuCount > 0 ? menuScore / menuCount : 0;

  // Weight: specialties 60%, menu categories 30%, vendor rating 10%
  const combined = specialtyAvg * 0.6 + menuAvg * 0.3 + (vendor.rating / 5) * 0.1;

  return Math.round(Math.min(combined * 100, 100));
}

/**
 * Gets match scores for all verified vendors for a given buyer.
 */
export async function getVendorMatchScores(buyerId: string) {
  const vendors = await prisma.vendorProfile.findMany({
    where: { verified: true },
    select: {
      id: true,
      kitchenName: true,
      specialties: true,
      rating: true,
      city: true,
      state: true,
      menuItems: { where: { isAvailable: true }, select: { category: true } },
      user: { select: { id: true, name: true } },
    },
  });

  const scores = await Promise.all(
    vendors.map(async (v) => ({
      vendorId: v.id,
      kitchenName: v.kitchenName,
      matchScore: await calculateMatchScore(buyerId, v.id),
      specialties: v.specialties,
      rating: v.rating,
      city: v.city,
      state: v.state,
    }))
  );

  return scores.sort((a, b) => b.matchScore - a.matchScore);
}
