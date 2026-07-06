import { FoodRequest, VendorProfile } from "../models";

const vendors: VendorProfile[] = [];

export function findEligibleVendors(request: FoodRequest): VendorProfile[] {
  return vendors.filter((v) => {
    const matchesCategory = v.specialty.includes(request.category);
    const isVerified = v.verified;
    const isOnline = v.isOnline;
    const meetsRating = v.rating >= 3.5;
    return matchesCategory && isVerified && isOnline && meetsRating;
  });
}

export function registerVendor(vendor: VendorProfile) {
  vendors.push(vendor);
}
