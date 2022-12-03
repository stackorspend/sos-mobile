import { Galoy } from "../services/galoy"

export const receiveLnNoAmount = async (args: { memo: string }) => {
  const galoy = await Galoy()
  if (galoy instanceof Error) return galoy

  return galoy.createNoAmountLnInvoice(args)
}
