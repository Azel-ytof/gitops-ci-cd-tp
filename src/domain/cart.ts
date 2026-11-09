import { findProduct } from "./catalog.ts";

export type Line = { productId: string; quantity: number };

export type Quote = {
  /** Montants en centimes */
  subtotal: number;
  discount: number;
  fee: number;
  total: number;
};

export const MAX_QUANTITY = 20;
export const DISCOUNT_THRESHOLD = 5000; // RG-03 : 5 % de remise dès 50 €
export const FREE_PICKUP_THRESHOLD = 3000; // RG-04 : retrait gratuit à partir de 30 €
export const PICKUP_FEE = 200;
export const MINIMUM_ORDER = 1000; // RG-05

export class InvalidCart extends Error {}

/** RG-01 et RG-02 : chaque ligne doit désigner un produit connu, en quantité entière de 1 à 20. */
export function checkLines(lines: Line[]): void {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new InvalidCart("Le panier est vide");
  }
  for (const line of lines) {
    if (!findProduct(line.productId)) {
      throw new InvalidCart(`Produit inconnu : ${line.productId}`);
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      throw new InvalidCart(`Quantité invalide pour ${line.productId} : de 1 à ${MAX_QUANTITY}`);
    }
  }
}

export function subtotal(lines: Line[]): number {
  return lines.reduce((sum, l) => sum + (findProduct(l.productId)?.price ?? 0) * l.quantity, 0);
}

/** RG-03 : 5 % de remise dès 50 € d'achats, arrondie au centime. */
export function discount(amount: number): number {
  return amount >= DISCOUNT_THRESHOLD ? Math.round(amount * 0.05) : 0;
}

/** RG-04 : 2 € de frais de retrait sous 30 €, gratuit à partir de 30 €. */
export function pickupFee(amount: number): number {
  return amount >= FREE_PICKUP_THRESHOLD ? 0 : PICKUP_FEE;
}

export function quote(lines: Line[]): Quote {
  checkLines(lines);
  const st = subtotal(lines);
  const d = discount(st);
  const f = pickupFee(st - d);
  return { subtotal: st, discount: d, fee: f, total: st - d + f };
}
