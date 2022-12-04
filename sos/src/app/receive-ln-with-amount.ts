import { Galoy } from "../services/galoy"

export const receiveLnWithAmount = async ({
  galoy: galoyConfig,
  ...args
}: ReceiveLnWithAmountArgs & Config) => {
  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) return galoy

  return galoy.createWithAmountLnInvoice(args)
}
