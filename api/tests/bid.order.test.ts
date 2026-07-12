import request from "supertest";
import app from "../index";
import { prisma } from "../lib/prisma";
import * as paystack from "../services/paystackService";

jest.mock("../services/paystackService");

const mockedPaystack = paystack as jest.Mocked<typeof paystack>;

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
}

async function createUser(role: "buyer" | "vendor") {
  const email = uniqueEmail(role);
  const res = await request(app).post("/api/auth/sign-up").send({
    email,
    password: "Password123!",
    name: `Test ${role}`,
    role,
    vendorVerification:
      role === "vendor"
        ? { streetAddress: "1 Test St", city: "Lagos", state: "LA", landmark: "" }
        : undefined,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create ${role}: ${JSON.stringify(res.body)}`);
  }
  const user = res.body.data;
  if (role === "vendor") {
    await prisma.vendorProfile.update({
      where: { userId: user.id },
      data: { verified: true },
    });
  }
  return { ...user, password: "Password123!" };
}

async function createRequest(buyerToken: string) {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const res = await request(app)
    .post("/api/requests")
    .set("Authorization", `Bearer ${buyerToken}`)
    .send({
      foodName: "Jollof Rice Platter",
      category: "Rice dishes",
      quantity: 1,
      unit: "Pot",
      budgetMin: 4000,
      budgetMax: 6000,
      deliveryAddress: "123 Test Avenue, Lagos",
      deliveryDateTime: future,
    });
  expect(res.status).toBe(201);
  return res.body.data;
}

async function placeBid(vendorToken: string, requestId: string) {
  const res = await request(app)
    .post("/api/bids")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      requestId,
      bidAmount: 5000,
      prepTimeMinutes: 60,
      estimatedDeliveryTime: "Tomorrow by 2pm",
      message: "Happy to cook this",
    });
  expect(res.status).toBe(201);
  return res.body.data;
}

async function createOrder(buyerToken: string, requestId: string, vendorId: string, bidId: string) {
  const res = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${buyerToken}`)
    .send({
      requestId,
      vendorId,
      bidId,
      foodCost: 4500,
      deliveryFee: 300,
      platformFee: 150,
      escrowFee: 50,
      totalAmount: 5000,
    });
  return res;
}

describe("Bid / order / payment lifecycle", () => {
  const createdUserIds: string[] = [];
  let dbAvailable = false;
  let buyer: { id: string; token: string } = { id: "", token: "" };
  let vendor: { id: string; token: string } = { id: "", token: "" };
  let postedRequest: { id: string; buyerId: string; status: string } = { id: "", buyerId: "", status: "" };
  let bid: { id: string; vendorId: string; status: string } = { id: "", vendorId: "", status: "" };
  let order: { id: string; totalAmount: number; status: string; requestId: string } = { id: "", totalAmount: 0, status: "", requestId: "" };

  beforeAll(async () => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch (err) {
      console.warn("Database unavailable; skipping bid/order integration tests", err);
      return;
    }
    const buyerRecord = await createUser("buyer");
    const vendorRecord = await createUser("vendor");
    createdUserIds.push(buyerRecord.id, vendorRecord.id);
    buyer = { id: buyerRecord.id, token: buyerRecord.token };
    vendor = { id: vendorRecord.id, token: vendorRecord.token };
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    try {
      await prisma.escrowTransaction.deleteMany({ where: {} });
      await prisma.escrowWallet.deleteMany({ where: {} });
      await prisma.order.deleteMany({ where: {} });
      await prisma.bid.deleteMany({ where: {} });
      await prisma.foodRequest.deleteMany({ where: {} });
      if (createdUserIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
      }
    } catch (err) {
      console.error("Integration test teardown failed", err);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("lists the buyer market publicly", async () => {
    if (!dbAvailable) return;
    const res = await request(app).get("/api/requests");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("creates a request as a buyer", async () => {
    if (!dbAvailable) return;
    postedRequest = await createRequest(buyer.token);
    expect(postedRequest.buyerId).toBe(buyer.id);
    expect(postedRequest.status).toBe("open");
  });

  it("allows a verified vendor to place a bid", async () => {
    if (!dbAvailable) return;
    bid = await placeBid(vendor.token, postedRequest.id);
    expect(bid.vendorId).toBe(vendor.id);
    expect(bid.status).toBe("active");
  });

  it("lets the buyer select a bid and leaves the request awaiting payment", async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .patch(`/api/bids/${bid.id}/select`)
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({});
    expect(res.status).toBe(200);

    const updatedRequest = await prisma.foodRequest.findUnique({
      where: { id: postedRequest.id },
    });
    expect(updatedRequest?.status).toBe("bid_selected");
    expect(updatedRequest?.selectedBidId).toBe(bid.id);

    const selectedBid = await prisma.bid.findUnique({ where: { id: bid.id } });
    expect(selectedBid?.status).toBe("selected");
  });

  it("creates an order in accepted status after bid selection", async () => {
    if (!dbAvailable) return;
    const res = await createOrder(buyer.token, postedRequest.id, vendor.id, bid.id);
    expect(res.status).toBe(201);
    order = res.body.data;
    expect(order.status).toBe("accepted");
    expect(order.requestId).toBe(postedRequest.id);
  });

  it("prevents duplicate active orders for the same request", async () => {
    if (!dbAvailable) return;
    const res = await createOrder(buyer.token, postedRequest.id, vendor.id, bid.id);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("lets the vendor paginate and filter their bids", async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .get("/api/bids/my?status=selected&page=1&limit=5")
      .set("Authorization", `Bearer ${vendor.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination.page).toBe(1);
  });

  it("allows the buyer to reopen the request before payment", async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post(`/api/requests/${postedRequest.id}/reopen`)
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({});
    expect(res.status).toBe(200);

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder?.status).toBe("cancelled");

    const updatedRequest = await prisma.foodRequest.findUnique({
      where: { id: postedRequest.id },
    });
    expect(updatedRequest?.status).toBe("open");
    expect(updatedRequest?.selectedBidId).toBeNull();

    const bids = await prisma.bid.findMany({ where: { requestId: postedRequest.id } });
    expect(bids.every((b) => b.status === "active")).toBe(true);
  });

  it("moves order and request to paid after successful payment verification", async () => {
    if (!dbAvailable) return;
    // Re-select and create a fresh order for this test
    await request(app).patch(`/api/bids/${bid.id}/select`).set("Authorization", `Bearer ${buyer.token}`).send({});
    const orderRes = await createOrder(buyer.token, postedRequest.id, vendor.id, bid.id);
    expect(orderRes.status).toBe(201);
    const freshOrder = orderRes.body.data;

    const reference = `test-ref-${Date.now()}`;
    mockedPaystack.initializeTransaction.mockResolvedValueOnce({
      authorization_url: "https://paystack.test/pay",
      access_code: "test_access",
      reference,
    });

    const initiateRes = await request(app)
      .post("/api/escrow/initiate-payment")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({ orderId: freshOrder.id });
    expect(initiateRes.status).toBe(200);
    expect(initiateRes.body.data.authorization_url).toBe("https://paystack.test/pay");

    mockedPaystack.verifyTransaction.mockResolvedValueOnce({
      status: "success",
      reference,
      amount: 5000,
    });

    const verifyRes = await request(app).post("/api/escrow/verify-payment").send({ reference });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.status).toBe("success");

    const paidOrder = await prisma.order.findUnique({ where: { id: freshOrder.id } });
    expect(paidOrder?.status).toBe("paid");

    const paidRequest = await prisma.foodRequest.findUnique({ where: { id: postedRequest.id } });
    expect(paidRequest?.status).toBe("paid");
  });
});
