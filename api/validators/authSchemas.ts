import { z } from "zod";

const baseSignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const vendorVerificationSchema = z.object({
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  landmark: z.string().min(1, "Landmark is required"),
  kitchenMediaCount: z.number().int().nonnegative(),
  idCardProvided: z.boolean(),
  utilityBillProvided: z.boolean(),
});

export const signUpSchema = z.union([
  baseSignUpSchema.extend({ role: z.literal("buyer") }),
  baseSignUpSchema.extend({
    role: z.literal("vendor"),
    vendorVerification: vendorVerificationSchema,
  }),
  baseSignUpSchema.extend({ role: z.literal("admin") }),
]);

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
