import { z } from "zod";

export const createRequestSchema = z.object({
  buyerId: z.string().cuid2().optional(),
  foodName: z.string().min(1, "Food name is required"),
  category: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional().default(1),
  unit: z.string().optional().default("Portion"),
  budgetMin: z.coerce.number().nonnegative().optional().default(0),
  budgetMax: z.coerce.number().nonnegative().optional().default(0),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryDateTime: z.string().datetime(),
  instructions: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateRequestStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});

export const createBidSchema = z.object({
  requestId: z.string().cuid2("Request ID must be a valid CUID"),
  bidAmount: z.coerce.number().positive("Bid amount must be greater than 0"),
  prepTimeMinutes: z.coerce.number().int().nonnegative().optional().default(0),
  estimatedDeliveryTime: z.string().optional(),
  message: z.string().optional(),
});

export const updateBidSchema = z.object({
  bidAmount: z.coerce.number().positive("Bid amount must be greater than 0").optional(),
  prepTimeMinutes: z.coerce.number().int().nonnegative().optional(),
  estimatedDeliveryTime: z.string().optional(),
  message: z.string().optional(),
});

export const counterBidSchema = z.object({
  bidAmount: z.coerce.number().positive("Counter amount must be greater than 0"),
  message: z.string().optional(),
});

const optionalCuid2 = z.union([z.string().length(0), z.string().cuid2()]).optional().transform((v) => (v === "" ? undefined : v));

export const createOrderSchema = z.object({
  requestId: optionalCuid2,
  vendorId: z.string().cuid2("Vendor ID must be a valid CUID"),
  bidId: optionalCuid2,
  foodCost: z.coerce.number().nonnegative().optional().default(0),
  deliveryFee: z.coerce.number().nonnegative().optional().default(0),
  platformFee: z.coerce.number().nonnegative().optional().default(0),
  escrowFee: z.coerce.number().nonnegative().optional().default(0),
  totalAmount: z.coerce.number().nonnegative().optional().default(0),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "paid",
    "accepted",
    "cooking",
    "ready_for_pickup",
    "picked_up",
    "delivered",
    "completed",
    "disputed",
    "cancelled",
  ]),
});

export const openDisputeSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  openedById: z.string().cuid2().optional(),
});

export const addMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Price must be a non-negative number"),
  category: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateVendorProfileSchema = z.object({
  kitchenName: z.string().min(1).optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  landmark: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  isOnline: z.boolean().optional(),
});

export const uploadVendorDocumentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  fileBase64: z.string().min(1, "File data is required"),
});

export const initiatePaymentSchema = z.object({
  orderId: z.string().cuid2("Order ID must be a valid CUID"),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  account_number: z.string().min(1, "Account number is required"),
  bank_code: z.string().min(1, "Bank code is required"),
});

export const legacyDepositSchema = z.object({
  vendorId: z.string().cuid2(),
  amount: z.coerce.number().nonnegative(),
  orderId: z.string().cuid2().optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1, "Resolution is required"),
});

export const flagVendorSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export const reviewDocumentSchema = z.object({
  reason: z.string().optional(),
});

export const vendorMarketOfferSchema = z.object({
  menuItemId: z.string().cuid2(),
  vendorId: z.string().cuid2(),
  quantity: z.coerce.number().int().min(1),
  servings: z.coerce.number().int().min(1).optional(),
  deliveryDate: z.coerce.date().optional(),
  note: z.string().optional(),
  proposedPrice: z.coerce.number().nonnegative(),
});

export const updateVendorMarketOfferSchema = z.object({
  status: z.enum(["accepted", "rejected", "countered", "cancelled"]),
  proposedPrice: z.coerce.number().nonnegative().optional(),
  note: z.string().optional(),
});
