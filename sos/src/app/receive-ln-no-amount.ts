import { Galoy } from "../services/galoy"

export const receiveLnNoAmount = async ({
  galoy: galoyConfig,
  ...args
}: ReceiveLnNoAmountArgs & Config) => {
  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) return galoy

  return galoy.createNoAmountLnInvoice(args)
}
