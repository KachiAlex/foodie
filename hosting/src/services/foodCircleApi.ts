import { api } from "./apiClient";

export interface FoodCircle {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  isMember: boolean;
  _count: { members: number; groupOrders: number };
  members?: CircleMember[];
  groupOrders?: GroupOrder[];
}

export interface CircleMember {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string };
  vendorProfile?: { id: string; kitchenName: string; specialties: string[] } | null;
}

export interface GroupOrder {
  id: string;
  circleId: string;
  creatorId: string;
  vendorId: string;
  menuItemId: string | null;
  foodName: string;
  cuisine: string;
  targetServings: number;
  filledServings: number;
  pricePerServing: string;
  totalDeliveryFee: string;
  deliveryFeePerServing: string;
  deliveryWindow: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  vendor: { id: string; kitchenName: string; specialties?: string[] };
  creator: { id: string; name: string };
  slots: GroupOrderSlot[];
}

export interface GroupOrderSlot {
  id: string;
  buyerId: string;
  servings: number;
  amountPaid: string;
  status: string;
  buyer: { id: string; name: string };
}

export async function listCircles(): Promise<FoodCircle[]> {
  return api.get<FoodCircle[]>("/circles");
}

export async function getCircle(circleId: string): Promise<FoodCircle> {
  return api.get<FoodCircle>(`/circles/${circleId}`);
}

export async function createCircle(data: {
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}): Promise<FoodCircle> {
  return api.post<FoodCircle>("/circles", data);
}

export async function joinCircle(circleId: string, vendorProfileId?: string): Promise<unknown> {
  return api.post(`/circles/${circleId}/join`, { vendorProfileId });
}

export async function leaveCircle(circleId: string): Promise<void> {
  await api.del(`/circles/${circleId}/leave`);
}

export async function listGroupOrders(circleId: string): Promise<GroupOrder[]> {
  return api.get<GroupOrder[]>(`/circles/${circleId}/group-orders`);
}

export async function createGroupOrder(
  circleId: string,
  data: {
    vendorId: string;
    menuItemId?: string;
    foodName: string;
    cuisine: string;
    targetServings: number;
    pricePerServing: number;
    totalDeliveryFee: number;
    deliveryWindow: string;
    deliveryAddress: string;
  }
): Promise<GroupOrder> {
  return api.post<GroupOrder>(`/circles/${circleId}/group-orders`, data);
}

export async function joinGroupOrder(
  groupOrderId: string,
  servings: number
): Promise<{ slot: GroupOrderSlot; amountPaid: number }> {
  return api.post(`/circles/group-orders/${groupOrderId}/join`, { servings });
}
