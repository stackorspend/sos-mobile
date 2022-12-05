import { TableNotCreatedYetError, UnknownRepositoryError } from "../../domain/error"

import { BASE_TXNS_ASC_SELECT, handleRow } from "./requests/select-txns-alt"

const REQUESTS_DIR = "./src/services/sqlite/requests"

const DEFAULT_PAGE_SIZE = 10

const TXNS_TABLE = "transactions"
const CALCS_TABLE = "txn_calculations"

const CREATE_CALCS_TABLE = `
CREATE TABLE IF NOT EXISTS txn_calculations (
  source_tx_id TEXT NOT NULL UNIQUE,
  timestamp TEXT NOT NULL,

  aggregate_sats INTEGER NOT NULL,
  aggregate_fiat_amount REAL NOT NULL,
  stack_price_with_pl_included REAL,

  fiat_amount_less_pl REAL NOT NULL,
  fiat_pl REAL NOT NULL,
  fiat_pl_percentage TEXT NOT NULL,
  aggregate_fiat_amount_less_pl REAL NOT NULL,
  stack_price_without_pl REAL NOT NULL
)
`

const CREATE_TXNS_TABLE_WITH_GENERATED = `
CREATE TABLE IF NOT EXISTS transactions (
  sats_amount_with_fee INTEGER NOT NULL,
  sats_fee INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  fiat_per_sat INTEGER NOT NULL,
  fiat_per_sat_offset INTEGER NOT NULL,
  fiat_code TEXT NOT NULL,
  fiat_amount_with_fee REAL GENERATED ALWAYS AS (
      ROUND(
          sats_amount_with_fee * fiat_per_sat / POWER(10, fiat_per_sat_offset),
          4
      )
  ) STORED,
  fiat_fee REAL GENERATED ALWAYS AS (
      ROUND(
          sats_fee * fiat_per_sat / POWER(10, fiat_per_sat_offset),
          4
      )
  ) STORED,
  source_name TEXT NOT NULL,
  source_tx_id TEXT NOT NULL UNIQUE,
  tx_status TEXT NOT NULL,
  ln_payment_hash TEXT,
  onchain_tx_id TEXT
)
`

const CREATE_TXNS_TABLE = `
CREATE TABLE IF NOT EXISTS transactions (
  sats_amount_with_fee INTEGER NOT NULL,
  sats_fee INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  fiat_per_sat INTEGER NOT NULL,
  fiat_per_sat_offset INTEGER NOT NULL,
  fiat_code TEXT NOT NULL,
  fiat_amount_with_fee REAL,
  fiat_fee REAL,
  source_name TEXT NOT NULL,
  source_tx_id TEXT NOT NULL UNIQUE,
  tx_status TEXT NOT NULL,
  ln_payment_hash TEXT,
  onchain_tx_id TEXT
)
`

const INSERT_TXN = `
INSERT INTO transactions (
  sats_amount_with_fee,
  sats_fee,
  timestamp,
  fiat_per_sat,
  fiat_per_sat_offset,
  fiat_code,
  source_name,
  source_tx_id,
  ln_payment_hash,
  onchain_tx_id,
  tx_status,
  fiat_amount_with_fee,
  fiat_fee
) VALUES (
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?
)
`

const INSERT_CALC = `
INSERT INTO txn_calculations (
  source_tx_id,
  timestamp,

  aggregate_sats,
  aggregate_fiat_amount,
  stack_price_with_pl_included,
  fiat_amount_less_pl,
  fiat_pl,
  fiat_pl_percentage,
  aggregate_fiat_amount_less_pl,
  stack_price_without_pl
) VALUES (
  ?,
  ?,

  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?
)
ON CONFLICT(source_tx_id) DO UPDATE SET
  aggregate_sats = ?,
  aggregate_fiat_amount = ?,
  stack_price_with_pl_included = ?,
  fiat_amount_less_pl = ?,
  fiat_pl = ?,
  fiat_pl_percentage = ?,
  aggregate_fiat_amount_less_pl = ?,
  stack_price_without_pl = ?
`

const SELECT_LATEST_CALC = `
  SELECT * FROM ${CALCS_TABLE}
  ORDER BY timestamp DESC LIMIT 1;
`

const TXNS_JOIN = `
  SELECT * FROM transactions
  INNER JOIN txn_calculations
  ON transactions.source_tx_id = txn_calculations.source_tx_id
  ORDER BY timestamp DESC, sats_amount_with_fee DESC
  LIMIT ?;
`

const TXNS_JOIN_PAGE = `
  SELECT * FROM transactions
  INNER JOIN txn_calculations
  ON transactions.source_tx_id = txn_calculations.source_tx_id
  WHERE (
    transactions.timestamp = ( SELECT transactions.timestamp FROM transactions WHERE source_tx_id = ?)
    AND sats_amount_with_fee < ( SELECT sats_amount_with_fee FROM transactions WHERE source_tx_id = ?)
  )
  OR transactions.timestamp < ( SELECT transactions.timestamp FROM transactions WHERE source_tx_id = ?)
  ORDER BY transactions.timestamp DESC, sats_amount_with_fee DESC
  LIMIT ?;
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

export const TransactionsRepositoryAlt = (db: SqliteDb) => {
  console.log("Using TransactionsRepositoryAlt...")

  const checkRepositoryExists = async (): Promise<boolean | Error> => {
    try {
      const txns: Txn[] | undefined = await db.select({
        query: `SELECT * FROM ${TXNS_TABLE}`,
      })
      const txn = txns && txns.length ? txns[0] : undefined
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
      await db.create(DROP_TXNS_TABLE)
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
      const [{ sum }] = await db.select({ query: SUM_SATS_AMOUNT })
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
      const txns: Txn[] | undefined = await db.select({
        query: "SELECT * FROM transactions WHERE source_tx_id = ?",
        args: [id],
      })
      const txn = txns && txns.length ? txns[0] : undefined
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
        ? await db.select({
            query: TXNS_JOIN_PAGE,
            args: [after, after, after, first || DEFAULT_PAGE_SIZE],
          })
        : await db.select({ query: TXNS_JOIN, args: [first || DEFAULT_PAGE_SIZE] })
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
      rows = await db.select({ query: BASE_TXNS_ASC_SELECT })
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
      const rows = await db.select({ query: SELECT_MISMATCHED_IDS })
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
      const rows = await db.select({ query: SELECT_LATEST_CALC })
      const row = rows && rows.length ? rows[0] : undefined
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
      await db.create(CREATE_TXNS_TABLE)

      console.log("Preparing persist statement...")
      const start = Date.now()

      for (const txn of rows) {
        const fiat_per_sat = Math.round(txn.price * 10 ** 4)

        const row = [
          txn.sats, // [":sats_amount_with_fee"]
          txn.satsFee, // [":sats_fee"]
          new Date(txn.timestamp * 1000).toISOString(), // [":timestamp"]
          fiat_per_sat, // [":fiat_per_sat"]
          12, // [":fiat_per_sat_offset"]
          "USD", // [":fiat_code"]
          "galoy", // [":source_name"]
          txn.id, // [":source_tx_id"]
          txn.paymentHash, // [":ln_payment_hash"]
          txn.txId, // [":onchain_tx_id"]

          // TODO: figure how to check & finalize pending txns
          txn.status, // [":tx_status"]

          (txn.sats * fiat_per_sat) / 10 ** 12, // [":fiat_amount_with_fee"]
          (txn.satsFee * fiat_per_sat) / 10 ** 12, // [":fiat_fee"]
        ]

        await db.insert({
          query: INSERT_TXN,
          row,
        })
      }

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
      await db.create(CREATE_CALCS_TABLE)

      console.log("Preparing calcs persist statement...")
      const start = Date.now()

      for (const row of rows) {
        await db.insert({
          query: INSERT_CALC,
          row: [
            row.source_tx_id, // [":source_tx_id"]
            row.timestamp, // [":timestamp"]

            row.aggregate_sats, // [":aggregate_sats"]
            row.aggregate_fiat_amount, // [":aggregate_fiat_amount"]
            row.stack_price_with_pl_included, // [":stack_price_with_pl_included"]
            row.fiat_amount_less_pl, // [":fiat_amount_less_pl"]
            row.fiat_pl, // [":fiat_pl"]
            row.fiat_pl_percentage, // [":fiat_pl_percentage"]
            row.aggregate_fiat_amount_less_pl, // [":aggregate_fiat_amount_less_pl"]
            row.stack_price_without_pl, // [":stack_price_without_pl"]

            row.aggregate_sats, // [":aggregate_sats"]
            row.aggregate_fiat_amount, // [":aggregate_fiat_amount"]
            row.stack_price_with_pl_included, // [":stack_price_with_pl_included"]
            row.fiat_amount_less_pl, // [":fiat_amount_less_pl"]
            row.fiat_pl, // [":fiat_pl"]
            row.fiat_pl_percentage, // [":fiat_pl_percentage"]
            row.aggregate_fiat_amount_less_pl, // [":aggregate_fiat_amount_less_pl"]
            row.stack_price_without_pl, // [":stack_price_without_pl"]
          ],
        })
      }

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
