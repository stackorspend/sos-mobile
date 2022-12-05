import {
  CalculationsMismatchError,
  LocalBalanceDoesNotMatchSourceError,
  TableNotCreatedYetError,
} from "../domain/error"
import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

export const IMPORT_PAGE_SIZE = 100
export const SYNC_PAGE_SIZE = 10

export const syncLatestTxns = async ({
  db,
  pageSize,
  rescanForMissing = false,
  rebuild = false,

  galoy: galoyConfig,
}: SyncTxnsArgs & Config) => {
  // TODO: Figure out how to fix mismatched/corrupted txns on rescanForMissing

  const txnsRepo = TransactionsRepository(db)

  const galoy = await Galoy(galoyConfig)
  if (galoy instanceof Error) {
    return galoy
  }

  if (rebuild) txnsRepo.deleteRepositoryForRebuild()

  const data: INPUT_TXN[] = []
  let transactions: Txn[]
  let lastCursor: string | false | null = null
  let hasNextPage: boolean = true
  let finish = false
  while ((rescanForMissing || !finish) && hasNextPage && lastCursor !== false) {
    // Fetch from source
    ;({ transactions, lastCursor, hasNextPage } = await galoy.fetchTransactionsPage({
      first: pageSize,
      cursorFetchAfter: lastCursor,
    }))

    // Sort fetched
    const txnsDesc = transactions.sort((a: Txn, b: Txn) =>
      a.node.createdAt < b.node.createdAt
        ? 1
        : a.node.createdAt > b.node.createdAt
        ? -1
        : 0,
    )

    // Process for local format
    for (const tx of txnsDesc) {
      const {
        id,
        settlementAmount,
        settlementFee,
        settlementPrice: { base },
        createdAt: timestamp,
        status,
        memo,
        initiationVia: { paymentHash, address },
        settlementVia: { transactionHash: txId },
      } = tx.node

      const txInDb = await txnsRepo.fetchTxnById(id)
      if (txInDb instanceof Error && !(txInDb instanceof TableNotCreatedYetError)) {
        throw txInDb
      }
      if (!(txInDb === undefined || txInDb instanceof Error)) {
        finish = true
        continue
      }
      console.log(`Writing new txn '${id}'...`)
      data.push({
        id,
        timestamp,
        sats: settlementAmount,
        satsFee: -settlementFee,
        price: base / 10 ** 6,
        status,
        description: memo || "",
        paymentHash,
        txId,
      })
    }
  }
  // Persist locally
  const res = await txnsRepo.persistManyTxns(data)

  // Check balance
  // Note, figure how to (default is rescanForMissing):
  //  - handle pending transactions that disappear later (e.g. RBF)
  //  - handle pending incoming onchain transactions that get replaced when confirmed
  const sumFromLocal = await txnsRepo.sumSatsAmount()
  const balanceFromSource = await galoy.balance()
  if (sumFromLocal !== balanceFromSource) {
    return new LocalBalanceDoesNotMatchSourceError(
      JSON.stringify({ sumFromLocal, balanceFromSource }),
    )
  }

  // Calculate stack prices from last known point

  // 1. Check for last entry in table
  const lastRow = await txnsRepo.fetchLatestCalc()

  // 2. Start iterating through transactions table and populating state table
  const allRowsWithCalcs = await txnsRepo.processCalculationsForTransactions()
  if (allRowsWithCalcs instanceof Error) return allRowsWithCalcs
  let row: CalcRowRaw
  const rowsToPersist: CalcRow[] = []
  for (row of allRowsWithCalcs) {
    const rowToPersist = {
      source_tx_id: row.source_tx_id,
      timestamp: row.timestamp,
      aggregate_sats: row.agg_sats,
      aggregate_fiat_amount: row.agg_fiat_with_pl,
      stack_price_with_pl_included: row.avg_price_with_pl,
      fiat_amount_less_pl: row.fiat_no_pl,
      fiat_pl: row.fiat_pl,
      fiat_pl_percentage: row.pl_pct,
      aggregate_fiat_amount_less_pl: row.agg_fiat_no_pl,
      stack_price_without_pl: row.avg_price_no_pl,
    }
    rowsToPersist.push(rowToPersist)
  }
  const result = await txnsRepo.persistManyCalcs(rowsToPersist)
  if (result instanceof Error) return result

  // 3. Finish with check
  const mismatchedIds = await txnsRepo.fetchMismatchedIds()
  if (mismatchedIds instanceof Error) return mismatchedIds

  const lastTxn = await txnsRepo.fetchTxns({ first: 1 })
  if (lastTxn instanceof Error) return lastTxn
  const { aggregate_sats } = lastTxn[0]

  const calcMatchCheck =
    mismatchedIds && mismatchedIds.length === 0 && sumFromLocal === aggregate_sats
  if (!calcMatchCheck) return new CalculationsMismatchError()

  return true
}
