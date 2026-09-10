import { config } from "./config.ts";
import type { Order } from "./domain/order.ts";

/** Envoi de l'e-mail de confirmation (simulé : le service d'e-mail n'existe pas dans le TP). */
export function sendConfirmation(order: Order): boolean {
  console.log(`[mail] confirmation de ${order.id} envoyée à ${order.customer.email} via ${config.mailApiUrl}`);
  return true;
}
