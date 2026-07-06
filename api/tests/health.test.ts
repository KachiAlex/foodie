import request from "supertest";
import app from "../index";

describe("GET /api/health", () => {
  it("returns a 200 OK status with a timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});
