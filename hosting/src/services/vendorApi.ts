import type { VendorMetric, MenuItem, VendorOpenRequest } from "@/data/mock";
import {
  vendorMetrics as initialMetrics,
  menuItems as initialMenuItems,
  vendorOpenRequests as initialOpenRequests,
} from "@/data/mock";

const METRICS_KEY = "foodiemarket_vendor_metrics";
const MENU_KEY = "foodiemarket_vendor_menu";
const OPEN_REQUESTS_KEY = "foodiemarket_vendor_open_requests";

function getStoredMetrics(): VendorMetric[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (raw) return JSON.parse(raw) as VendorMetric[];
  } catch {
    // ignore
  }
  return initialMetrics;
}

function getStoredMenu(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw) return JSON.parse(raw) as MenuItem[];
  } catch {
    // ignore
  }
  return initialMenuItems;
}

function getStoredOpenRequests(): VendorOpenRequest[] {
  try {
    const raw = localStorage.getItem(OPEN_REQUESTS_KEY);
    if (raw) return JSON.parse(raw) as VendorOpenRequest[];
  } catch {
    // ignore
  }
  return initialOpenRequests;
}

function saveMenu(menu: MenuItem[]) {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}

function saveOpenRequests(requests: VendorOpenRequest[]) {
  localStorage.setItem(OPEN_REQUESTS_KEY, JSON.stringify(requests));
}

export interface AddMenuItemPayload {
  name: string;
  price: string;
  availability: string;
  tags: string[];
}

export async function fetchVendorMetrics(): Promise<VendorMetric[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getStoredMetrics();
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getStoredMenu();
}

export async function addMenuItem(payload: AddMenuItemPayload): Promise<MenuItem> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const menu = getStoredMenu();
  const newItem: MenuItem = {
    id: `M-${String(menu.length + 1).padStart(2, "0")}`,
    name: payload.name,
    price: payload.price,
    availability: payload.availability,
    tags: payload.tags,
  };
  menu.push(newItem);
  saveMenu(menu);
  return newItem;
}

export async function fetchVendorOpenRequests(): Promise<VendorOpenRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredOpenRequests();
}

export async function createVendorOpenRequest(
  payload: Omit<VendorOpenRequest, "id">
): Promise<VendorOpenRequest> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const requests = getStoredOpenRequests();
  const newRequest: VendorOpenRequest = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    ...payload,
  };
  requests.push(newRequest);
  saveOpenRequests(requests);
  return newRequest;
}
