export const TICKET_PRICES_CENTS: Record<string, number> = {
  standard: 14900,
  student: 4900,
  vip: 39900,
};

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calcTotal(
  ticketType: string,
  quantity: number,
  discountPct: number
): { unit: number; subtotal: number; discount: number; total: number } {
  const unit = TICKET_PRICES_CENTS[ticketType] ?? 0;
  const subtotal = unit * quantity;
  const discount = Math.round((subtotal * discountPct) / 100);
  return { unit, subtotal, discount, total: subtotal - discount };
}
