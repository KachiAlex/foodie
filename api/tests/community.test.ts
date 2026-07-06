import request from "supertest";
import app from "../index";

describe("Vendor market endpoints", () => {
  it("returns 401 when creating an offer without authentication", async () => {
    const res = await request(app).post("/api/community/offers").send({
      menuItemId: "clxyz12345678901234567890",
      vendorId: "clxyz12345678901234567890",
      quantity: 1,
      proposedPrice: 1000,
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 when listing offers without authentication", async () => {
    const res = await request(app).get("/api/community/offers");
    expect(res.status).toBe(401);
  });
});
