export const satsToUSD = (sats: number, price: number) => {
  if (!price) return 0
  if (!sats) return 0
  return (sats * price) / 100000000
}
