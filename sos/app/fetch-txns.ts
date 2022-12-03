import { TransactionsRepository } from "../services/sqlite"

export const fetchTxns = async ({
  db,
  first,
  after,
}: {
  db: Db
  first?: number
  after?: string
}) => {
  const txns = await TransactionsRepository(db).fetchTxns({
    first,
    after,
  })
  if (txns instanceof Error) return txns

  return {
    cursor: txns && txns.length ? txns[txns.length - 1].source_tx_id : after,
    txns: txns.map(mapTxns),
  }
}

const mapTxns = (txn) => {
  // TODO: if txn is 'canceled' then set fee to '0'
  const { sats_amount_with_fee: satsAmountWithFee, sats_fee: satsFee } = txn
  const satsAmount = Number((satsAmountWithFee - satsFee).toFixed(4))

  const { fiat_amount_with_fee: fiatAmountWithFee, fiat_fee: fiatFee } = txn
  const fiatAmount = Number((fiatAmountWithFee - fiatFee).toFixed(4))

  return {
    timestamp: txn.timestamp,
    source: txn.source_name,
    sourceId: txn.source_tx_id,
    txStatus: txn.tx_status,
    sats: {
      amountWithFee: satsAmountWithFee,
      amount: satsAmount,
      fee: satsFee,
    },
    fiat: {
      amountWithFee: fiatAmountWithFee,
      amount: fiatAmount,
      fee: fiatFee,
      code: txn.fiat_code,
    },
    txPrice: txn.fiat_per_sat / 10 ** 4,
    stackAvgPrice: txn.stack_price_without_pl,
    gainLoss: txn.fiat_pl_percentage,
  }
}
