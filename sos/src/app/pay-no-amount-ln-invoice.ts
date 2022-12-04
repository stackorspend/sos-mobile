import { Galoy } from "../services/galoy"
import { TransactionsRepository } from "../services/sqlite"

import { IMPORT_PAGE_SIZE, syncLatestTxns, SYNC_PAGE_SIZE } from "./sync-txns"

export const payNoAmountLnInvoice = async ({
  db,
  galoy: galoyConfig,
  ...args
}: PayNoAmountLnInvoiceArgs & Config) => {
  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) return galoy

  const sendResult = await galoy.sendLnPaymentWithAmount(args)
  if (sendResult instanceof Error) return sendResult

  const exists = await TransactionsRepository(db).checkRepositoryExists()
  if (exists instanceof Error) throw exists
  const synced = await syncLatestTxns({
    db,
    pageSize: exists ? SYNC_PAGE_SIZE : IMPORT_PAGE_SIZE,
    galoy: galoyConfig,
  })
  if (synced instanceof Error) return synced

  return sendResult
}
