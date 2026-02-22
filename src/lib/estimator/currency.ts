export function formatCurrency(value: number, currency: "EUR" | "PLN"): string {
  if (currency === "PLN") {
    // Format PLN: usually without cents if whole, but let's use Intl.NumberFormat
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Format EUR
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Convert
export function convertEurToPln(
  eurValue: number,
  exchangeRate: number
): number {
  return Math.round(eurValue * exchangeRate);
}
