export type NotificationPayload = {
  recipientId: string;
  title: string;
  body: string;
  type: "bid_received" | "bid_selected" | "order_update" | "payment" | "dispute";
};

const queue: NotificationPayload[] = [];

/**
 * Queues a notification for delivery.
 *
 * In production, wire this to your push/SMS provider (FCM, OneSignal,
 * Termii, etc.) by replacing the logger below with the actual send call.
 */
export function queueNotification(payload: NotificationPayload) {
  queue.push(payload);
  // eslint-disable-next-line no-console
  console.log(`[Notification] ${payload.type} -> ${payload.recipientId}: ${payload.title}`);
}

export function getQueuedNotifications(recipientId: string): NotificationPayload[] {
  return queue.filter((n) => n.recipientId === recipientId);
}

/** Drain the queue (useful for testing or a background worker). */
export function drainQueue(): NotificationPayload[] {
  const drained = queue.slice();
  queue.length = 0;
  return drained;
}
