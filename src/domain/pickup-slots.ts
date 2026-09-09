/**
 * RG-06 : retrait à la ferme, du mardi au samedi, de 9 h à 12 h ou de 16 h à 19 h,
 * au plus tôt 24 h après la commande.
 */
export type Slot = { start: string; end: string };

const OPEN_DAYS = [2, 3, 4, 5, 6]; // mardi à samedi
const OPENING_HOURS = [
  [9, 12],
  [16, 19],
];
const MINIMUM_DELAY_MS = 24 * 60 * 60 * 1000;

export function isOpenDay(date: Date): boolean {
  return OPEN_DAYS.includes(date.getDay());
}

export function nextSlots(from: Date, count = 6): Slot[] {
  const slots: Slot[] = [];
  const earliest = from.getTime() + MINIMUM_DELAY_MS;
  const day = new Date(from);
  day.setHours(0, 0, 0, 0);
  while (slots.length < count) {
    if (isOpenDay(day)) {
      for (const [h1, h2] of OPENING_HOURS) {
        const start = new Date(day);
        start.setHours(h1);
        const end = new Date(day);
        end.setHours(h2);
        if (start.getTime() >= earliest && slots.length < count) {
          slots.push({ start: start.toISOString(), end: end.toISOString() });
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}

export function isValidSlot(start: string, now: Date): boolean {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return false;
  if (!isOpenDay(d)) return false;
  if (d.getTime() - now.getTime() < MINIMUM_DELAY_MS) return false;
  return OPENING_HOURS.some(([h1]) => d.getHours() === h1 && d.getMinutes() === 0);
}
