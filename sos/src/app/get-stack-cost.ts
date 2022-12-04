import { TransactionsRepository } from "../services/sqlite"

export const getStackCost = async (db: Db): Promise<number | Error> => {
  const txns = await TransactionsRepository(db).processCalculationsForTransactions()
  if (txns instanceof Error) return txns

  const lastTxn = txns[txns.length - 1]
  // @ts-ignore-next-line no-implicit-any error
  return lastTxn.avg_price_no_pl
}
