type ActionResponse = {
  success: boolean;
  message: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function approvePayoutRequest(payoutId: string): Promise<ActionResponse> {
  await delay(600);
  return {
    success: true,
    message: `Payout ${payoutId} released to vendor`,
  };
}

export async function createOrderEscalation(orderId: string): Promise<ActionResponse> {
  await delay(700);
  return {
    success: true,
    message: `Escalation logged for ${orderId}`,
  };
}

export async function triggerVendorAudit(vendorId: string): Promise<ActionResponse> {
  await delay(500);
  return {
    success: true,
    message: `Audit scheduled for ${vendorId}`,
  };
}
