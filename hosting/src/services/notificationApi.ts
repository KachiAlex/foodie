import { api } from "./apiClient";

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>("/notifications");
}

export async function markNotificationRead(id: string): Promise<{ count: number }> {
  return api.patch<{ count: number }>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<{ count: number }> {
  return api.patch<{ count: number }>("/notifications/read-all", {});
}
