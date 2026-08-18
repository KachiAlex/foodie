import { prisma } from "../lib/prisma";

interface BidRecommendation {
  suggestedBid: number;
  winProbability: number;
  minProfitableBid: number;
  averageWinningBid: number;
  bidCount: number;
  confidence: "low" | "medium" | "high";
}

/**
 * Analyzes historical bid data to recommend an optimal bid price for a vendor.
 */
export async function getBidRecommendation(
  vendorId: string,
  requestId: string
): Promise<BidRecommendation> {
  // Get the request details
  const request = await prisma.foodRequest.findUnique({
    where: { id: requestId },
    include: {
      bids: {
        select: {
          bidAmount: true,
          status: true,
          vendorId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) {
    return {
      suggestedBid: 0,
      winProbability: 0,
      minProfitableBid: 0,
      averageWinningBid: 0,
      bidCount: 0,
      confidence: "low",
    };
  }

  const category = request.category;
  const budgetMax = Number(request.budgetMax);
  const budgetMin = Number(request.budgetMin);
  const quantity = request.quantity;

  // Get historical winning bids for similar requests (same category, similar quantity)
  const historicalOrders = await prisma.order.findMany({
    where: {
      request: {
        category: category,
        quantity: { gte: Math.max(1, quantity - 2), lte: quantity + 2 },
      },
      status: { in: ["completed", "delivered", "cooking", "paid"] },
    },
    select: {
      foodCost: true,
      request: { select: { category: true, quantity: true, budgetMin: true, budgetMax: true } },
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  // Get this vendor's past bids and win rate
  const vendorBids = await prisma.bid.findMany({
    where: { vendorId },
    select: {
      bidAmount: true,
      status: true,
      request: { select: { category: true, quantity: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  // Calculate average winning bid from historical orders
  const winningBids = historicalOrders.map((o) => Number(o.foodCost));
  const averageWinningBid =
    winningBids.length > 0
      ? winningBids.reduce((a, b) => a + b, 0) / winningBids.length
      : (budgetMin + budgetMax) / 2;

  // Calculate vendor's personal win rate at different price points
  const vendorWon = vendorBids.filter((b) => b.status === "selected");
  const vendorLost = vendorBids.filter((b) => b.status === "rejected" || b.status === "expired");
  const winRate = vendorBids.length > 0 ? vendorWon.length / vendorBids.length : 0.5;

  // Vendor's average winning bid
  const vendorWonAmounts = vendorWon.map((b) => Number(b.bidAmount));
  const vendorAvgWinBid =
    vendorWonAmounts.length > 0
      ? vendorWonAmounts.reduce((a, b) => a + b, 0) / vendorWonAmounts.length
      : averageWinningBid;

  // Minimum profitable bid (rough estimate: 60% of average winning bid covers ingredients)
  const minProfitableBid = Math.round(averageWinningBid * 0.6);

  // Suggested bid: blend of vendor's winning average and market average
  // Weight vendor's own data more if they have more history
  const vendorWeight = Math.min(vendorWon.length / 10, 0.5);
  const marketWeight = 1 - vendorWeight;
  const suggestedBid = Math.round(
    vendorAvgWinBid * vendorWeight + averageWinningBid * marketWeight
  );

  // Clamp to buyer's budget range
  const clampedBid = Math.min(Math.max(suggestedBid, budgetMin), budgetMax);

  // Win probability estimation using logistic-like function
  // Higher bid relative to budget = lower win probability
  const budgetMidpoint = (budgetMin + budgetMax) / 2;
  const budgetRange = budgetMax - budgetMin || 1;
  const priceRatio = (clampedBid - budgetMidpoint) / (budgetRange / 2);

  // Logistic function: at midpoint, probability = winRate
  // Below midpoint, probability increases; above, decreases
  const winProbability = Math.round(
    Math.max(5, Math.min(95, winRate * 100 * (1 / (1 + Math.exp(priceRatio * 2)))))
  );

  // Confidence based on data availability
  const totalDataPoints = historicalOrders.length + vendorBids.length;
  let confidence: "low" | "medium" | "high" = "low";
  if (totalDataPoints >= 20) confidence = "high";
  else if (totalDataPoints >= 8) confidence = "medium";

  return {
    suggestedBid: clampedBid,
    winProbability,
    minProfitableBid,
    averageWinningBid: Math.round(averageWinningBid),
    bidCount: vendorBids.length,
    confidence,
  };
}
