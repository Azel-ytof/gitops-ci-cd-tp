import { describe, expect, it } from "vitest";
import { discount, InvalidCart, pickupFee, quote } from "../src/domain/cart.ts";

describe("RG-01 et RG-02 : les lignes du panier", () => {
  it("refuse un panier vide", () => {
    expect(() => quote([])).toThrow(InvalidCart);
  });

  it("refuse un produit inconnu", () => {
    expect(() => quote([{ productId: "p99", quantity: 1 }])).toThrow("Produit inconnu");
  });

  it.each([0, 21, 1.5])("refuse une quantité de %s", (quantity) => {
    expect(() => quote([{ productId: "p1", quantity }])).toThrow("Quantité invalide");
  });

  it("accepte 20 exemplaires d'un produit", () => {
    expect(quote([{ productId: "p2", quantity: 20 }]).subtotal).toBe(7600);
  });
});

describe("RG-03 : 5 % de remise dès 50 €", () => {
  it("pas de remise à 49,99 €", () => {
    expect(discount(4999)).toBe(0);
  });

  it("5 % de remise à exactement 50 €", () => {
    expect(discount(5000)).toBe(250);
  });

  it("arrondit la remise au centime", () => {
    expect(discount(6390)).toBe(320);
  });
});

describe("RG-04 : frais de retrait", () => {
  it("2 € sous 30 €", () => {
    expect(pickupFee(2999)).toBe(200);
  });

  it("gratuit à 30 €", () => {
    expect(pickupFee(3000)).toBe(0);
  });
});

describe("Devis complet", () => {
  it("un panier de légumes et deux pots de miel", () => {
    // 15,00 + 2 × 9,90 = 34,80 € : pas de remise, retrait gratuit
    expect(
      quote([
        { productId: "p1", quantity: 1 },
        { productId: "p4", quantity: 2 },
      ]),
    ).toEqual({ subtotal: 3480, discount: 0, fee: 0, total: 3480 });
  });

  it("quatre paniers de légumes", () => {
    // 60,00 € - 3,00 € de remise
    expect(quote([{ productId: "p1", quantity: 4 }])).toEqual({ subtotal: 6000, discount: 300, fee: 0, total: 5700 });
  });
});
