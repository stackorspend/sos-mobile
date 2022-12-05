import { Galoy } from "../services/galoy"

const SATS_PER_BTC = 100_000_000
const CENTS_PER_USD = 100

export const getCurrentPrice = async ({
  galoy: galoyConfig,
}: Config): GetCurrentPriceResult => {
  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) return galoy

  const priceData = await galoy.getBtcPrice()
  if (priceData instanceof Error) return priceData

  const { base, offset } = priceData
  const centPerSat = base / 10 ** offset

  return {
    usdPerBtc: centPerSat * (SATS_PER_BTC / CENTS_PER_USD),
  }
}
