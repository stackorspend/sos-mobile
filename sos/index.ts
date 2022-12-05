import {
  fetchTxns,
  syncLatestTxns,
  getStackCost,
  getCurrentPrice,
  payNoAmountLnInvoice,
  payWithAmountLnInvoice,
  receiveLnNoAmount,
  receiveLnWithAmount,
} from "./src/app"

// API definition
export const StackorSpend = (config: {
  galoy: { endpoint: string; token: string }
}): StackorSpend => {
  return {
    syncTxns: (args) => syncLatestTxns({ ...args, ...config }),

    fetchTxns,
    getStackCost,
    getCurrentPrice: () => getCurrentPrice(config),
    // checkPlannedStackTxn,
    // checkPlannedSpendTxn,

    payNoAmountLnInvoice: (args) => payNoAmountLnInvoice({ ...args, ...config }),
    payWithAmountLnInvoice: (args) => payWithAmountLnInvoice({ ...args, ...config }),
    receiveLnNoAmount: (args) => receiveLnNoAmount({ ...args, ...config }),
    receiveLnWithAmount: (args) => receiveLnWithAmount({ ...args, ...config }),

    // payOnChainAddress,
    // receiveOnChain,
  }
}
