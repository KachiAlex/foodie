import request from "supertest";
import app from "../index";

describe("Auth input validation", () => {
  it("rejects sign-up with missing email", async () => {
    const res = await request(app)
      .post("/api/auth/sign-up")
      .send({ password: "password123", name: "Test", role: "buyer" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects sign-up with a password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/sign-up")
      .send({ email: "test@example.com", password: "short", name: "Test", role: "buyer" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects sign-in with an invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/sign-in")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
