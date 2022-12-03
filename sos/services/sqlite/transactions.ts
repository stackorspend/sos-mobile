import fs from "fs"
import { TableNotCreatedYetError, UnknownRepositoryError } from "../../domain/error"

import { BASE_TXNS_ASC_SELECT, handleRow } from "./requests/select-txns"

const REQUESTS_DIR = "./src/services/sqlite/requests"

const DEFAULT_PAGE_SIZE = 10

const TXNS_TABLE = "transactions"
const CALCS_TABLE = "txn_calculations"

const CREATE_TXNS_TABLE = fs.readFileSync(`${REQUESTS_DIR}/create-txns-table.sql`, "utf8")
const CREATE_CALCS_TABLE = fs.readFileSync(
  `${REQUESTS_DIR}/create-txn-calcs-table.sql`,
  "utf8",
)
const INSERT_TXN = fs.readFileSync(`${REQUESTS_DIR}/insert-txn.sql`, "utf8")
const INSERT_CALC = fs.readFileSync(`${REQUESTS_DIR}/upsert-calc.sql`, "utf8")

const SELECT_LATEST_CALC = `
  SELECT * FROM ${CALCS_TABLE}
  ORDER BY timestamp DESC LIMIT 1;
`

const TXNS_JOIN = `
  SELECT * FROM transactions
  INNER JOIN txn_calculations
  ON transactions.source_tx_id = txn_calculations.source_tx_id
  ORDER BY timestamp DESC, sats_amount_with_fee DESC
  LIMIT :first;
`

const TXNS_JOIN_PAGE = `
  SELECT * FROM transactions
  INNER JOIN txn_calculations
  ON transactions.source_tx_id = txn_calculations.source_tx_id
  WHERE (
    transactions.timestamp = ( SELECT transactions.timestamp FROM transactions WHERE source_tx_id = :after)
    AND sats_amount_with_fee < ( SELECT sats_amount_with_fee FROM transactions WHERE source_tx_id = :after)
  )
  OR transactions.timestamp < ( SELECT transactions.timestamp FROM transactions WHERE source_tx_id = :after)
  ORDER BY transactions.timestamp DESC, sats_amount_with_fee DESC
  LIMIT :first
`

const SELECT_MISMATCHED_IDS = `
  SELECT transactions.source_tx_id FROM transactions
  LEFT JOIN txn_calculations
  ON transactions.source_tx_id = txn_calculations.source_tx_id
  WHERE txn_calculations.source_tx_id IS NULL

  UNION ALL

  SELECT txn_calculations.source_tx_id FROM txn_calculations
  LEFT JOIN transactions
  ON txn_calculations.source_tx_id = transactions.source_tx_id
  WHERE transactions.source_tx_id IS NULL
`

const DROP_TXNS_TABLE = `DROP TABLE IF EXISTS ${TXNS_TABLE};`

export const TransactionsRepository = (db: Db) => {
  const checkRepositoryExists = async (): Promise<boolean | Error> => {
    try {
      const txn: Txn | undefined = await db.get(`SELECT * FROM ${TXNS_TABLE}`)
      return true
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return false
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const deleteRepositoryForRebuild = async (): Promise<true | Error> => {
    try {
      await db.run(DROP_TXNS_TABLE)
      return true
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const sumSatsAmount = async (): Promise<number | Error> => {
    const SUM_SATS_AMOUNT = `SELECT SUM(sats_amount_with_fee) as sum FROM transactions;`
    try {
      const { sum } = await db.get(SUM_SATS_AMOUNT)
      return sum || 0
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const fetchTxnById = async (id: string): Promise<Txn | undefined | Error> => {
    try {
      const txn: Txn | undefined = await db.get(
        "SELECT * FROM transactions WHERE source_tx_id = ?",
        id,
      )
      return txn
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const fetchTxns = async ({ first, after }: { first?: number; after?: string }) => {
    try {
      // Note: These potentially break if there are more than one records with
      //       the same 'sats_amount_with_fee' and 'timestamp' values (which should never happen)
      const rows = after
        ? await db.all(TXNS_JOIN_PAGE, {
            [":first"]: first || DEFAULT_PAGE_SIZE,
            [":after"]: after,
          })
        : await db.all(TXNS_JOIN, { [":first"]: first || DEFAULT_PAGE_SIZE })
      return rows
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const processCalculationsForTransactions = async () => {
    let acc = { avg_price_no_pl: 0, agg_fiat_no_pl: 0 }
    let prev = { prev_agg_sats: 0, prev_avg_price: 0 }

    let rows: INPUT_TXN[]
    try {
      rows = await db.all(BASE_TXNS_ASC_SELECT)
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError(message)
      }
    }

    let newRow
    let newRows = []
    for (const row of rows) {
      ;({ acc, prev, row: newRow } = handleRow({ acc, prev, row }))
      // @ts-ignore-next-line no-implicit-any error
      newRows.push(newRow)
    }

    return newRows
  }

  const fetchMismatchedIds = async (): Promise<{ source_tx_id: string }[] | Error> => {
    try {
      const rows = await db.all(SELECT_MISMATCHED_IDS)
      return rows
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const fetchLatestCalc = async () => {
    try {
      const row = await db.get(SELECT_LATEST_CALC)
      return row
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return undefined
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const persistManyTxns = async (rows: INPUT_TXN[]) => {
    try {
      await db.run(CREATE_TXNS_TABLE)

      console.log("Preparing persist statement...")
      const start = Date.now()

      const stmt = await db.prepare(INSERT_TXN)
      for (const txn of rows) {
        await stmt.run({
          [":sats_amount_with_fee"]: txn.sats,
          [":sats_fee"]: txn.satsFee,
          [":timestamp"]: new Date(txn.timestamp * 1000).toISOString(),
          [":fiat_per_sat"]: Math.round(txn.price * 10 ** 4),
          [":fiat_per_sat_offset"]: 12,
          [":fiat_code"]: "USD",
          [":source_name"]: "galoy",
          [":source_tx_id"]: txn.id,
          [":ln_payment_hash"]: txn.paymentHash,
          [":onchain_tx_id"]: txn.txId,
          // TODO: figure how to check & finalize pending txns
          [":tx_status"]: txn.status,
        })
      }

      await stmt.finalize()
      const elapsed = (Date.now() - Number(start)) / 1000
      console.log(`Persisted ${rows.length} records in ${elapsed}s.`)
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const persistManyCalcs = async (rows) => {
    try {
      await db.run(CREATE_CALCS_TABLE)

      console.log("Preparing calcs persist statement...")
      const start = Date.now()

      const stmt = await db.prepare(INSERT_CALC)
      for (const row of rows) {
        await stmt.run({
          [":source_tx_id"]: row.source_tx_id,
          [":timestamp"]: row.timestamp,
          [":aggregate_sats"]: row.aggregate_sats,
          [":aggregate_fiat_amount"]: row.aggregate_fiat_amount,
          [":stack_price_with_pl_included"]: row.stack_price_with_pl_included,
          [":fiat_amount_less_pl"]: row.fiat_amount_less_pl,
          [":fiat_pl"]: row.fiat_pl,
          [":fiat_pl_percentage"]: row.fiat_pl_percentage,
          [":aggregate_fiat_amount_less_pl"]: row.aggregate_fiat_amount_less_pl,
          [":stack_price_without_pl"]: row.stack_price_without_pl,
        })
      }

      await stmt.finalize()
      const elapsed = (Date.now() - Number(start)) / 1000
      console.log(`Persisted ${rows.length} calc records in ${elapsed}s.`)
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  return {
    checkRepositoryExists,
    deleteRepositoryForRebuild,
    sumSatsAmount,
    fetchTxnById,
    fetchTxns,
    processCalculationsForTransactions,
    fetchMismatchedIds,
    fetchLatestCalc,
    persistManyTxns,
    persistManyCalcs,
  }
}
