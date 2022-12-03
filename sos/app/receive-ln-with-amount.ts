import { Galoy } from "../services/galoy"

export const receiveLnWithAmount = async (args: { amount: number; memo: string }) => {
  const galoy = await Galoy()
  if (galoy instanceof Error) return galoy

  return galoy.createWithAmountLnInvoice(args)
}
