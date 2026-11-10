import { describe, expect, it } from "vitest";
import { isOpenDay, isValidSlot, nextSlots } from "../src/domain/pickup-slots.ts";

// RG-06 : retrait du mardi au samedi, à 9 h ou à 16 h, au plus tôt 24 h après la commande.
// Les dates s'écrivent new Date(année, mois - 1, jour, heure) : new Date(2026, 9, 20, 16) est le mardi 20 octobre à 16 h.
// Le 19 octobre 2026 est un lundi.
const monday10am = new Date(2026, 9, 19, 10);
const friday6pm = new Date(2026, 9, 23, 18);

describe("RG-06 : les créneaux proposés", () => {
  it("propose 6 créneaux par défaut", () => {
    expect(nextSlots(monday10am)).toHaveLength(6);
  });
});

// TODO TP 2 : les cas limites de RG-06 ne sont pas testés (voyez la couverture : npm run test:coverage).
// Retirez « .skip », puis remplacez chaque undefined par la valeur attendue d'après RG-06.
describe("RG-06 : jours d'ouverture", () => {
  it("le mardi 20 est ouvert", () => {
    expect(isOpenDay(new Date(2026, 9, 20))).toBe(true);
  });

  it("le lundi 19", () => {
    expect(isOpenDay(new Date(2026, 9, 19))).toBe(false);
  });

  it("le samedi 24", () => {
    expect(isOpenDay(new Date(2026, 9, 24))).toBe(true);
  });

  it("le dimanche 25", () => {
    expect(isOpenDay(new Date(2026, 9, 25))).toBe(false);
  });
});

describe("RG-06 : premier créneau proposé", () => {
  it("commande le lundi à 10 h", () => {
    const first = new Date(nextSlots(monday10am)[0].start);
    expect(first).toEqual(new Date(2026, 9, 20, 16)); // une date : new Date(2026, 9, …, …)
  });

  it("commande le vendredi à 18 h", () => {
    const first = new Date(nextSlots(friday6pm)[0].start);
    expect(first).toEqual(new Date(2026, 9, 27, 9));
  });
});

describe("RG-06 : validité d'un créneau", () => {
  it("mardi 16 h, commandé lundi 10 h : valide", () => {
    expect(isValidSlot(new Date(2026, 9, 20, 16).toISOString(), monday10am)).toBe(true);
  });

  it("mardi 9 h, commandé lundi 10 h", () => {
    expect(isValidSlot(new Date(2026, 9, 20, 9).toISOString(), monday10am)).toBe(false);
  });

  it("mercredi 10 h", () => {
    expect(isValidSlot(new Date(2026, 9, 21, 10).toISOString(), monday10am)).toBe(false);
  });

  it("dimanche 9 h : fermé, refusé", () => {
    expect(isValidSlot(new Date(2026, 9, 25, 9).toISOString(), monday10am)).toBe(false);
  });

  it("une date qui n'existe pas : refusée", () => {
    expect(isValidSlot("pas une date", monday10am)).toBe(false);
  });
});
