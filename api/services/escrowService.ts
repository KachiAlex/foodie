import { EscrowTransaction } from "../models";

const transactions: EscrowTransaction[] = [];

export function createEscrowTransaction(
  orderId: string,
  vendorId: string,
  amount: number,
  type: EscrowTransaction["type"]
): EscrowTransaction {
  const tx: EscrowTransaction = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    vendorId,
    amount,
    type,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  transactions.push(tx);
  return tx;
}

export function releaseEscrow(orderId: string): EscrowTransaction | null {
  const tx = transactions.find((t) => t.orderId === orderId && t.type === "deposit");
  if (!tx) return null;
  tx.status = "completed";
  return tx;
}

export function getVendorTransactions(vendorId: string): EscrowTransaction[] {
  return transactions.filter((t) => t.vendorId === vendorId);
}
