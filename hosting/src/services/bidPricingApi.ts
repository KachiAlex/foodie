import { api } from "./apiClient";

export interface BidRecommendation {
  suggestedBid: number;
  winProbability: number;
  minProfitableBid: number;
  averageWinningBid: number;
  bidCount: number;
  confidence: "low" | "medium" | "high";
}

export async function getBidRecommendation(requestId: string): Promise<BidRecommendation> {
  return api.get<BidRecommendation>(`/bid-pricing/recommendation/${requestId}`);
}
