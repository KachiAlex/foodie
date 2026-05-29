import type { BuyerRequest, RequestStatus, VendorBid } from "@/data/mock";
import { buyerRequests as initialRequests, vendorBids as initialBids } from "@/data/mock";

const REQUESTS_KEY = "foodiemarket_requests";
const BIDS_KEY = "foodiemarket_bids";

function getStoredRequests(): BuyerRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) return JSON.parse(raw) as BuyerRequest[];
  } catch {
    // ignore parse errors
  }
  return initialRequests;
}

function getStoredBids(): VendorBid[] {
  try {
    const raw = localStorage.getItem(BIDS_KEY);
    if (raw) return JSON.parse(raw) as VendorBid[];
  } catch {
    // ignore
  }
  return initialBids;
}

function saveRequests(requests: BuyerRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

function saveBids(bids: VendorBid[]) {
  localStorage.setItem(BIDS_KEY, JSON.stringify(bids));
}

export interface CreateRequestPayload {
  title: string;
  cuisine: string;
  portionType: "Pot" | "Portion" | "Tray";
  servings: number;
  budget: number;
  deliveryWindow: string;
}

export interface CreateBidPayload {
  requestId: string;
  chef: string;
  price: number;
  eta: string;
  confidence: number;
}

export async function fetchRequests(): Promise<BuyerRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredRequests();
}

export async function createRequest(payload: CreateRequestPayload): Promise<BuyerRequest> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const requests = getStoredRequests();
  const newRequest: BuyerRequest = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    title: payload.title,
    cuisine: payload.cuisine,
    portionType: payload.portionType,
    servings: payload.servings,
    budget: payload.budget,
    status: "collecting_bids",
    deliveryWindow: payload.deliveryWindow,
    bids: 0,
  };
  requests.unshift(newRequest);
  saveRequests(requests);
  return newRequest;
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<BuyerRequest> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const requests = getStoredRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) throw new Error("Request not found");
  requests[idx] = { ...requests[idx], status };
  saveRequests(requests);
  return requests[idx];
}

export async function fetchBids(): Promise<VendorBid[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredBids();
}

export async function createBid(payload: CreateBidPayload): Promise<VendorBid> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const bids = getStoredBids();
  const newBid: VendorBid = {
    id: `BID-${Math.floor(1000 + Math.random() * 9000)}`,
    requestId: payload.requestId,
    chef: payload.chef,
    price: payload.price,
    eta: payload.eta,
    confidence: payload.confidence,
  };
  bids.push(newBid);
  saveBids(bids);

  // Increment request bid count
  const requests = getStoredRequests();
  const reqIdx = requests.findIndex((r) => r.id === payload.requestId);
  if (reqIdx !== -1) {
    requests[reqIdx] = { ...requests[reqIdx], bids: requests[reqIdx].bids + 1 };
    saveRequests(requests);
  }

  return newBid;
}

// Admin actions
export async function deleteRequest(requestId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const requests = getStoredRequests().filter((r) => r.id !== requestId);
  saveRequests(requests);
}
