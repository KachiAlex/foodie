type NotificationPayload = {
  recipientId: string;
  title: string;
  body: string;
  type: "bid_received" | "bid_selected" | "order_update" | "payment" | "dispute";
};

const queue: NotificationPayload[] = [];

export function queueNotification(payload: NotificationPayload) {
  queue.push(payload);
  // TODO: integrate FCM / OneSignal / SMS gateway
  console.log(`[Notification] ${payload.type} -> ${payload.recipientId}: ${payload.title}`);
}

export function getQueuedNotifications(recipientId: string): NotificationPayload[] {
  return queue.filter((n) => n.recipientId === recipientId);
}
