import type { Order } from "./domain/order.ts";

/** Envoi de l'e-mail de confirmation (simulé : le service d'e-mail n'existe pas dans le TP). */
export function sendConfirmation(order: Order, apiKey: string | undefined): boolean {
  if (!apiKey) {
    console.warn(`[mail] pas de clé MAIL_API_KEY : confirmation de ${order.id} non envoyée`);
    return false;
  }
  console.log(`[mail] confirmation de ${order.id} envoyée à ${order.customer.email}`);
  return true;
}
