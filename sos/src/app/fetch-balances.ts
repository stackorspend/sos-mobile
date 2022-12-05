import { Galoy } from "../services/galoy"

export const fetchBalances = async ({
  galoy: galoyConfig,
}: Config): FetchBalancesResult => {
  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) return galoy

  const balance = await galoy.balance()
  if (balance instanceof Error) return balance

  return { satsBalance: balance }
}
