import request from "supertest";
import app from "../src/app.js";

describe("Sweets API - TDD Example", () => {

  test("GET /api/sweets returns array", async () => {
    const res = await request(app).get("/api/sweets");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Search sweets by name", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ q: "Gulab" });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
