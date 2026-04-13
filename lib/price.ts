export interface PricingRates {
  base: number;
  economy: number;
  business: number;
  luxury: number;
  economyPerHour: number;
  businessPerHour: number;
  luxuryPerHour: number;
}

export function calculatePrice({
  distance,
  vehicle,
  hours,
  rates,
}: {
  distance: number;
  vehicle: "economy" | "business" | "luxury";
  hours?: number;
  rates?: PricingRates;
}): number {
  const base = rates?.base ?? 10;

  const ratePerKm: Record<string, number> = {
    economy: rates?.economy ?? 0.8,
    business: rates?.business ?? 1.2,
    luxury: rates?.luxury ?? 1.8,
  };

  const ratePerHour: Record<string, number> = {
    economy: rates?.economyPerHour ?? 30,
    business: rates?.businessPerHour ?? 50,
    luxury: rates?.luxuryPerHour ?? 80,
  };

  if (hours && hours > 0) {
    return base + hours * ratePerHour[vehicle];
  }

  return base + distance * ratePerKm[vehicle];
}
