import { prisma } from "../lib/prisma";
import { emitToUser } from "../lib/socket";

export type NotificationPayload = {
  recipientId: string;
  title: string;
  body: string;
  type: "bid_received" | "bid_selected" | "order_update" | "payment" | "dispute" | "general";
  metadata?: any;
};

/**
 * Persists a notification to the database and emits it via Socket.io.
 */
export async function queueNotification(payload: NotificationPayload) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.recipientId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        read: false
      }
    });

    // Emit real-time notification via socket
    emitToUser(payload.recipientId, "notification", notification);
    
    // eslint-disable-next-line no-console
    console.log(`[Notification] ${payload.type} -> ${payload.recipientId}: ${payload.title}`);
    
    return notification;
  } catch (error) {
    console.error("[Notification Error]", error);
  }
}
