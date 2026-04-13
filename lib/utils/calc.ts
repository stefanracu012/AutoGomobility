export interface Extra {
  label: string;
  price: number;
}

/**
 * Calculate the total price for a booking.
 * total = basePrice + sum of all extras
 */
export function calculateTotal(basePrice: number, extras: Extra[]): number {
  const extrasSum = extras.reduce((sum, e) => sum + e.price, 0);
  return Math.round((basePrice + extrasSum) * 100) / 100;
}
