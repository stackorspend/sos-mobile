type INPUT_TXN = {
  id: string
  timestamp: number
  sats: number
  satsFee: number
  price: number
  status: string
  paymentHash: string | undefined
  txId: string | undefined
}

type Txn = {
  cursor: string
  node: {
    id: string
    createdAt: number
    settlementAmount: number
    settlementFee: number
    settlementPrice: {
      base: number
    }
    status: string
    initiationVia: {
      paymentHash?: string
      address?: string
    }
    settlementVia: {
      transactionHash?: string
    }
  }
}

type CalcRowRaw = {
  source_tx_id
  timestamp
  agg_sats
  avg_price_with_pl
  fiat_no_pl
  agg_fiat_with_pl
  fiat_pl
  pl_pct
  agg_fiat_no_pl
  avg_price_no_pl
}

type CalcRow = {
  source_tx_id
  timestamp
  aggregate_sats
  aggregate_fiat_amount
  stack_price_with_pl_included
  fiat_amount_less_pl
  fiat_pl
  fiat_pl_percentage
  aggregate_fiat_amount_less_pl
  stack_price_without_pl
}

type Db = import("sqlite").Database
