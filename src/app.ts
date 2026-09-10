import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import { InvalidCart, quote } from "./domain/cart.ts";
import { allProducts, findProduct } from "./domain/catalog.ts";
import { findOrder, InvalidOrder, placeOrder } from "./domain/order.ts";
import { nextSlots } from "./domain/pickup-slots.ts";
import { sendConfirmation } from "./notification.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

export function createApp() {
  const app = express();
  // TODO TP 3 : les en-têtes de sécurité HTTP. npm install helmet, import helmet from "helmet", puis :
  //   app.use(helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } }));
  // (upgradeInsecureRequests: null, car l'application tourne en HTTP sur votre poste)
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: process.env.APP_VERSION ?? "dev" });
  });

  app.get("/api/products", (_req, res) => {
    res.json(allProducts());
  });

  app.get("/api/products/:id", (req, res) => {
    const product = findProduct(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Produit introuvable" });
      return;
    }
    res.json(product);
  });

  app.post("/api/cart/quote", (req, res) => {
    res.json(quote(req.body?.lines));
  });

  app.get("/api/slots", (req, res) => {
    const from = typeof req.query.from === "string" ? new Date(req.query.from) : new Date();
    res.json(nextSlots(Number.isNaN(from.getTime()) ? new Date() : from));
  });

  app.post("/api/orders", (req, res) => {
    const { customer, lines, slot } = req.body ?? {};
    const order = placeOrder(customer, lines, slot);
    sendConfirmation(order);
    res.status(201).json({ id: order.id, total: order.quote.total });
  });

  app.get("/api/orders/:id", (req, res) => {
    const order = findOrder(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Commande introuvable" });
      return;
    }
    res.json(order);
  });

  // La page d'accueil utilise lodash, servi directement depuis node_modules
  app.get("/vendor/lodash.js", (_req, res) => {
    res.sendFile(require.resolve("lodash/lodash.js"));
  });
  app.use(express.static(path.join(root, "public")));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof InvalidCart || err instanceof InvalidOrder) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Erreur interne" });
  });

  return app;
}
