import type { BuyerOrder, VendorOrderStage } from "@/data/mock";
import { buyerOrders as initialOrders, vendorOrders as initialVendorOrders } from "@/data/mock";

const ORDERS_KEY = "foodiemarket_orders";
const VENDOR_ORDERS_KEY = "foodiemarket_vendor_orders";

function getStoredOrders(): BuyerOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as BuyerOrder[];
  } catch {
    // ignore
  }
  return initialOrders;
}

function getStoredVendorOrders(): VendorOrderStage[] {
  try {
    const raw = localStorage.getItem(VENDOR_ORDERS_KEY);
    if (raw) return JSON.parse(raw) as VendorOrderStage[];
  } catch {
    // ignore
  }
  return initialVendorOrders;
}

function saveOrders(orders: BuyerOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function saveVendorOrders(orders: VendorOrderStage[]) {
  localStorage.setItem(VENDOR_ORDERS_KEY, JSON.stringify(orders));
}

export interface CreateOrderPayload {
  chef: string;
  dishes: string;
  amount: number;
  eta: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: BuyerOrder["status"];
}

export async function fetchOrders(): Promise<BuyerOrder[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredOrders();
}

export async function createOrder(payload: CreateOrderPayload): Promise<BuyerOrder> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const orders = getStoredOrders();
  const newOrder: BuyerOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    chef: payload.chef,
    dishes: payload.dishes,
    amount: payload.amount,
    eta: payload.eta,
    status: "Cooking",
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export async function updateOrderStatus({ orderId, status }: UpdateOrderStatusPayload): Promise<BuyerOrder> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const orders = getStoredOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error("Order not found");
  orders[idx] = { ...orders[idx], status };
  saveOrders(orders);
  return orders[idx];
}

export async function fetchVendorOrders(): Promise<VendorOrderStage[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredVendorOrders();
}

export async function updateVendorOrderStatus(
  orderId: string,
  status: VendorOrderStage["status"]
): Promise<VendorOrderStage> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const orders = getStoredVendorOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error("Order not found");
  orders[idx] = { ...orders[idx], status };
  saveVendorOrders(orders);
  return orders[idx];
}

export async function createVendorOrder(order: Omit<VendorOrderStage, "id">): Promise<VendorOrderStage> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const orders = getStoredVendorOrders();
  const newOrder: VendorOrderStage = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: order.customer,
    items: order.items,
    status: order.status,
  };
  orders.push(newOrder);
  saveVendorOrders(orders);
  return newOrder;
}
