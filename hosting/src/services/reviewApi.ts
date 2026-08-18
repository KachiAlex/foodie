import { api } from "./apiClient";

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  vendorProfileId: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  buyer?: {
    id: string;
    name: string;
  };
}

export const createReview = async (reviewData: {
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
}) => {
  return api.post<Review>("/reviews", reviewData);
};

export const getVendorReviews = async (vendorId: string): Promise<Review[]> => {
  return api.get<Review[]>(`/reviews/vendor/${vendorId}`);
};
