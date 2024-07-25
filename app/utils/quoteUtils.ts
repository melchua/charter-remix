// Format the price above to USD using the locale, style, and currency.
export const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
