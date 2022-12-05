type GaloyConfig = { endpoint: string; token: string }

type Config = {
  galoy: GaloyConfig
}

type SyncTxnsArgs = {
  db: Db
  pageSize: number
  rescanForMissing?: boolean // continues scanning through all txns to find all missing txns
  rebuild?: boolean // drops table and does full rebuild
}

type FetchTxnsArgs = {
  db: Db
  first?: number
  after?: string
}

type FetchTxnsResult = Promise<{ cursor: string; txns: ApiTxn[] } | Error>

type TxStatusObject = {
  readonly SUCCESS: "SUCCESS"
}
type TxStatus = TxStatusObject[keyof TxStatusObject]

type ApiTxn = {
  timestamp: string
  source: string
  sourceId: string
  txStatus: TxStatus
  sats: {
    amountWithFee: number
    amount: number
    fee: number
  }
  fiat: {
    amountWithFee: number
    amount: number
    fee: number
    code: string
  }
  txPrice: number
  stackAvgPrice: number
  gainLoss: string
}

type GetCurrentPriceResult = Promise<{ usdPerBtc: number } | Error>

type FetchBalancesResult = Promise<{ satsBalance: number } | Error>

type PayNoAmountLnInvoiceArgs = {
  db: Db
  noAmountPaymentRequest: string
  amount: number
  memo: string
}

type PayLnInvoiceResult = Promise<
  | {
      status: string
      paymentHash?: string
      preImage: null
    }
  | Error
>

type PayWithAmountLnInvoiceArgs = {
  db: Db
  withAmountPaymentRequest: string
  memo: string
}

type ReceiveLnNoAmountArgs = { memo: string }

type ReceiveLnWithAmountArgs = { memo: string; amount: number }

type ReceiveLnResult = Promise<
  | {
      paymentRequest: string
      paymentHash: string
      paymentSecret: string
    }
  | Error
>

type StackorSpend = {
  syncTxns: (args: SyncTxnsArgs) => Promise<true | Error>
  fetchBalances: () => FetchBalancesResult

  fetchTxns: (args: FetchTxnsArgs) => FetchTxnsResult
  getStackCost: (db: Db) => Promise<number | Error>
  getCurrentPrice: () => GetCurrentPriceResult

  payNoAmountLnInvoice: (args: PayNoAmountLnInvoiceArgs) => PayLnInvoiceResult
  payWithAmountLnInvoice: (args: PayWithAmountLnInvoiceArgs) => PayLnInvoiceResult
  receiveLnNoAmount: (args: ReceiveLnNoAmountArgs) => ReceiveLnResult
  receiveLnWithAmount: (args: ReceiveLnWithAmountArgs) => ReceiveLnResult
}
