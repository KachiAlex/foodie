import { api } from "./apiClient";

export interface InitiatePaymentResult {
  authorization_url: string;
  reference: string;
}

export interface VerifyPaymentResult {
  status: "success" | "already_processed" | string;
  orderId?: string;
}

export interface EscrowWallet {
  id: string;
  available: number;
  pending: number;
  totalEarned: number;
  currency: string;
}

export interface EscrowTransaction {
  id: string;
  orderId?: string;
  amount: number;
  type: "deposit" | "release" | "refund" | "withdrawal";
  status: "pending" | "completed" | "failed";
  paystackReference?: string;
  createdAt: string;
}

export async function initiatePayment(orderId: string): Promise<InitiatePaymentResult> {
  return api.post<InitiatePaymentResult>("/escrow/initiate-payment", { orderId });
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  return api.post<VerifyPaymentResult>("/escrow/verify-payment", { reference });
}

export async function releaseEscrow(orderId: string): Promise<EscrowTransaction> {
  return api.post<EscrowTransaction>(`/escrow/release/${orderId}`, {});
}

export async function getWallet(): Promise<EscrowWallet> {
  return api.get<EscrowWallet>("/escrow/wallet");
}

export async function getTransactions(): Promise<EscrowTransaction[]> {
  return api.get<EscrowTransaction[]>("/escrow/transactions");
}
