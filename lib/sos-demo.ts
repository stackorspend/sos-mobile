import { StackorSpend } from "../sos"
import { SQLiteDb } from "./get-db"

// TODOS:
// - ApiTxn.memo

export const demoSoS = async () => {
  console.log("START")
  const db = SQLiteDb()

  const sos = StackorSpend({
    galoy: {
      endpoint: "https://api.staging.galoy.io/graphql/",
      token: "nWL9JckgHA6uMjwuz6kkYrAowrpNXSas",
    },
  })

  // ==========
  // Step 1: Sync transactions from Galoy source
  // ==========
  console.log("Syncing transactions from Galoy...")
  const synced = await sos.syncTxns({
    db,
    pageSize: 100,
    // rescanForMissing: true,
    // rebuild: true,
  })
  if (synced instanceof Error) throw synced
  console.log("Finished sync.")

  // ==========
  // Step 2: Retrieve synced transactions in pages
  // ==========
  const step2 = true
  if (step2) {
    console.log("Fetching transactions from local db...")
    const pageOne = await sos.fetchTxns({ db, first: 4 })
    if (pageOne instanceof Error) throw pageOne
    const { cursor, txns } = pageOne
    console.log("Page 1 txns:")
    console.log(JSON.stringify(txns, null, 2))
    console.log("Page 1 cursor:", cursor)
    const pageTwo = await sos.fetchTxns({ db, first: 2, after: cursor })
    console.log("Page 2:")
    console.log(JSON.stringify(pageTwo, null, 2))
  }

  // ==========
  // Step 3: Get figure for stack cost
  // ==========
  const step3 = true
  if (step3) {
    const stackCost = await sos.getStackCost(db)
    console.log("Current (DCA'd) stack cost is:", stackCost)

    const btcPrice = await sos.getCurrentPrice()
    if (btcPrice instanceof Error) throw btcPrice
    const { usdPerBtc } = btcPrice
    console.log("Current BTC price is:", usdPerBtc)

    const balances = await sos.fetchBalances()
    if (balances instanceof Error) throw balances
    const { satsBalance } = balances
    const fiatBalance = (satsBalance / 100_000_000) * usdPerBtc
    console.log("Current sats balance is:", satsBalance)
    console.log("Current fiat balance is:", fiatBalance)
  }
}
