import { InvalidCart, type Line, MINIMUM_ORDER, type Quote, quote } from "./cart.ts";
import { isValidSlot } from "./pickup-slots.ts";

export type Customer = { name: string; email: string };

export type Order = {
  id: string;
  customer: Customer;
  lines: Line[];
  slot: string;
  quote: Quote;
  createdAt: string;
};

export class InvalidOrder extends Error {}

const orders = new Map<string, Order>();
let counter = 0;

function checkCustomer(customer: Customer): void {
  if (!customer || typeof customer.name !== "string" || customer.name.trim().length === 0) {
    throw new InvalidOrder("Le nom du client est obligatoire");
  }
  if (typeof customer.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) {
    throw new InvalidOrder("L'adresse e-mail est invalide");
  }
}

export function placeOrder(customer: Customer, lines: Line[], slot: string, now = new Date()): Order {
  checkCustomer(customer);
  let q: Quote;
  try {
    q = quote(lines);
  } catch (e) {
    if (e instanceof InvalidCart) throw new InvalidOrder(e.message);
    throw e;
  }
  // RG-05 : commande minimale de 10 €
  if (q.total < MINIMUM_ORDER) {
    throw new InvalidOrder("La commande minimale est de 10 €");
  }
  if (!isValidSlot(slot, now)) {
    throw new InvalidOrder("Ce créneau de retrait n'est pas disponible");
  }
  counter += 1;
  const order: Order = {
    id: `CMD-${String(counter).padStart(4, "0")}`,
    customer,
    lines,
    slot,
    quote: q,
    createdAt: now.toISOString(),
  };
  orders.set(order.id, order);
  return order;
}

export function findOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function clearOrders(): void {
  orders.clear();
  counter = 0;
}
