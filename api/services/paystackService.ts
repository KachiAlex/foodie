const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const BASE_URL = "https://api.paystack.co";

async function paystackRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as { status: boolean; message: string; data: T };
  if (!json.status) throw new Error(json.message ?? "Paystack error");
  return json.data;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyResult {
  status: string;
  reference: string;
  amount: number;
  metadata?: Record<string, unknown>;
}

export interface TransferRecipientResult {
  recipient_code: string;
}

export interface TransferResult {
  transfer_code: string;
  status: string;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}): Promise<InitializeResult> {
  return paystackRequest<InitializeResult>("POST", "/transaction/initialize", {
    ...params,
    amount: Math.round(params.amount * 100),
    currency: "NGN",
  });
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  return paystackRequest<VerifyResult>("GET", `/transaction/verify/${reference}`);
}

export async function createTransferRecipient(params: {
  name: string;
  account_number: string;
  bank_code: string;
}): Promise<TransferRecipientResult> {
  return paystackRequest<TransferRecipientResult>("POST", "/transferrecipient", {
    type: "nuban",
    currency: "NGN",
    ...params,
  });
}

export async function initiateTransfer(params: {
  amount: number;
  recipient: string;
  reason: string;
  reference: string;
}): Promise<TransferResult> {
  return paystackRequest<TransferResult>("POST", "/transfer", {
    source: "balance",
    currency: "NGN",
    ...params,
    amount: Math.round(params.amount * 100),
  });
}
