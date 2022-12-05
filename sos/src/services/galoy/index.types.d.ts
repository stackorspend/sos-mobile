type TRANSACTION_RESPONSE = {
  errors
  data: {
    me: {
      defaultAccount: {
        wallets: {
          transactions: { pageInfo: { hasNextPage: boolean }; edges: Txn[] }
        }[]
      }
    }
  }
}

type BALANCE_RESPONSE = {
  errors
  data: {
    me: {
      defaultAccount: {
        wallets: {
          id: string
          balance: number
          pendingIncomingBalance: number
        }[]
      }
      errors: {
        message: string
        code: string
      }
    }
  }
}

type LN_SEND_PAYMENT_RESPONSE = {
  errors
  data: {
    lnInvoicePaymentSend: {
      status: string
      errors: [
        {
          message: string
          code: string
        },
      ]
    }
  }
}

type LN_SEND_PAYMENT_WITH_AMOUNT_RESPONSE = {
  errors
  data: {
    lnNoAmountInvoicePaymentSend: {
      status: string
      errors: {
        message: string
        code: string
      }[]
    }
  }
}

type LN_WITH_AMOUNT_INVOICE_CREATE_RESPONSE = {
  errors
  data: {
    lnInvoiceCreate: {
      invoice: {
        paymentRequest: string
        paymentHash: string
        paymentSecret: string
        satoshis: number
      }
      errors: {
        message: string
        code: string
      }[]
    }
  }
}

type LN_NO_AMOUNT_INVOICE_CREATE_RESPONSE = {
  errors
  data: {
    lnNoAmountInvoiceCreate: {
      invoice: {
        paymentRequest: string
        paymentHash: string
        paymentSecret: string
      }
      errors: {
        message: string
        code: string
      }[]
    }
  }
}

type BTC_PRICE = {
  errors
  data: {
    btcPrice: {
      base: number
      currencyUnit: string
      formattedAmount: string
      offset: number
    }
  }
}
