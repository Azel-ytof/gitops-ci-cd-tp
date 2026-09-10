import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";
import { clearOrders } from "../src/domain/order.ts";

const app = createApp();

describe("API CircuitCourt", () => {
  beforeEach(() => clearOrders());

  it("GET /health répond ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/products liste les 8 produits", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
  });

  it("GET /api/products/:id renvoie 404 pour un produit inconnu", async () => {
    const res = await request(app).get("/api/products/p99");
    expect(res.status).toBe(404);
  });

  it("POST /api/cart/quote calcule le total", async () => {
    const res = await request(app)
      .post("/api/cart/quote")
      .send({ lines: [{ productId: "p6", quantity: 2 }] });
    expect(res.body).toEqual({ subtotal: 720, discount: 0, fee: 200, total: 920 });
  });

  it("POST /api/cart/quote refuse un panier vide", async () => {
    const res = await request(app).post("/api/cart/quote").send({ lines: [] });
    expect(res.status).toBe(400);
  });

  it("POST /api/orders enregistre une commande", async () => {
    const slots = await request(app).get("/api/slots");
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer: { name: "Alice", email: "alice@exemple.fr" },
        lines: [{ productId: "p1", quantity: 1 }],
        slot: slots.body[0].start,
      });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "CMD-0001", total: 1700 });
  });

  it("POST /api/orders refuse une commande sous 10 €", async () => {
    const slots = await request(app).get("/api/slots");
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer: { name: "Alice", email: "alice@exemple.fr" },
        lines: [{ productId: "p2", quantity: 1 }],
        slot: slots.body[0].start,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("minimale");
  });

  it("POST /api/orders refuse une adresse e-mail invalide", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ customer: { name: "Alice", email: "alice" }, lines: [{ productId: "p1", quantity: 1 }] });
    expect(res.status).toBe(400);
  });
});
