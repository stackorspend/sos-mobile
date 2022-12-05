export const satsToUSD = (sats: number, price: number) => {
  if (!price) return 0
  if (!sats) return 0
  return (sats * price) / 100000000
}

export const toCurrency = (number) => {
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(number)
  return currency
}
export const toFormattedNumber = (number) => {
  const formatted = new Intl.NumberFormat().format(number)
  return formatted
}
