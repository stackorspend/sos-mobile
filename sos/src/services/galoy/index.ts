import fs from "fs"
import axios from "axios"

const galoyRequestsPath = "./src/services/galoy/requests"

const Transactions = fs.readFileSync(`${galoyRequestsPath}/transactions.gql`, "utf8")
const Balance = fs.readFileSync(`${galoyRequestsPath}/balance.gql`, "utf8")
const LnSendPayment = fs.readFileSync(`${galoyRequestsPath}/ln-send-payment.gql`, "utf8")
const LnSendPaymentWithAmount = fs.readFileSync(
  `${galoyRequestsPath}/ln-send-payment-with-amount.gql`,
  "utf8",
)
const LnWithAmountInvoiceCreate = fs.readFileSync(
  `${galoyRequestsPath}/ln-with-amount-invoice-create.gql`,
  "utf8",
)
const LnNoAmountInvoiceCreate = fs.readFileSync(
  `${galoyRequestsPath}/ln-no-amount-invoice-create.gql`,
  "utf8",
)

export const Galoy = async ({ endpoint, token }: GaloyConfig) => {
  const defaultHeaders = {
    "Accept": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  const getBtcWalletId = async () => {
    const query = {
      query: Balance,
    }

    const {
      data: { data, errors },
    }: { data: BALANCE_RESPONSE } = await axios.post(endpoint, query, {
      headers: defaultHeaders,
    })

    const errs = errors || data.me.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      me: {
        defaultAccount: {
          wallets: [{ id: walletId }],
        },
      },
    } = data

    return walletId
  }
  const btcWalletId = await getBtcWalletId()
  if (btcWalletId instanceof Error) return btcWalletId

  const balance = async () => {
    console.log("Fetching galoy wallet balance...")

    const query = {
      query: Balance,
    }

    const {
      data: { data, errors },
    }: { data: BALANCE_RESPONSE } = await axios.post(endpoint, query, {
      headers: defaultHeaders,
    })

    const errs = errors || data.me.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      me: {
        defaultAccount: {
          wallets: [{ balance, pendingIncomingBalance }],
        },
      },
    } = data

    return balance + pendingIncomingBalance
  }

  const fetchTransactionsPage = async ({
    first,
    cursorFetchAfter = null,
  }: {
    first: number
    cursorFetchAfter: string | null
  }) => {
    console.log("Fetching galoy txns...")

    const query = {
      query: Transactions,
      variables: {
        first,
        after: cursorFetchAfter,
      },
    }

    const {
      data: { data, errors },
    }: { data: TRANSACTION_RESPONSE } = await axios.post(endpoint, query, {
      headers: defaultHeaders,
    })

    const { edges, pageInfo } = data.me.defaultAccount.wallets[0].transactions
    console.log("Page:", { pageInfo, edges: edges.length })

    const { cursor }: { cursor: string | false } =
      edges && edges.length ? edges[edges.length - 1] : { cursor: false }
    const { hasNextPage } = pageInfo

    console.log(`Fetched ${edges.length} galoy txns for page`)
    return { transactions: edges, lastCursor: cursor, hasNextPage }
  }

  const sendLnPayment = async ({ withAmountPaymentRequest: paymentRequest, memo }) => {
    // TODO: validate if paymentRequest has amount

    const query = {
      query: LnSendPayment,
      variables: {
        input: {
          walletId: btcWalletId,
          paymentRequest,
          memo,
        },
      },
    }

    const {
      data: { data, errors },
    }: { data: LN_SEND_PAYMENT_RESPONSE } = await axios.post(endpoint, query, {
      headers: defaultHeaders,
    })
    const errs = errors || data.lnInvoicePaymentSend.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      lnInvoicePaymentSend: { status },
    } = data

    // TODO: populate paymentHash
    return { status, paymentHash: undefined, preImage: null }
  }

  const sendLnPaymentWithAmount = async ({
    noAmountPaymentRequest: paymentRequest,
    amount,
    memo,
  }) => {
    // TODO: validate if paymentRequest has no amount

    const query = {
      query: LnSendPaymentWithAmount,
      variables: {
        input: {
          walletId: btcWalletId,
          paymentRequest,
          amount,
          memo,
        },
      },
    }

    const {
      data: { data, errors },
    }: { data: LN_SEND_PAYMENT_WITH_AMOUNT_RESPONSE } = await axios.post(
      endpoint,
      query,
      {
        headers: defaultHeaders,
      },
    )
    const errs = errors || data.lnNoAmountInvoicePaymentSend.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      lnNoAmountInvoicePaymentSend: { status },
    } = data

    // TODO: populate paymentHash
    return { status, paymentHash: undefined, preImage: null }
  }

  const createWithAmountLnInvoice = async ({
    amount,
    memo,
  }: {
    amount: number
    memo: string
  }) => {
    const query = {
      query: LnWithAmountInvoiceCreate,
      variables: {
        input: {
          walletId: btcWalletId,
          amount,
          memo,
        },
      },
    }

    const {
      data: { data, errors },
    }: { data: LN_WITH_AMOUNT_INVOICE_CREATE_RESPONSE } = await axios.post(
      endpoint,
      query,
      {
        headers: defaultHeaders,
      },
    )
    const errs = errors || data.lnInvoiceCreate.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      lnInvoiceCreate: {
        invoice: { paymentRequest, paymentHash, paymentSecret },
      },
    } = data

    return { paymentRequest, paymentHash, paymentSecret }
  }

  const createNoAmountLnInvoice = async ({ memo }: { memo: string }) => {
    const query = {
      query: LnNoAmountInvoiceCreate,
      variables: {
        input: {
          walletId: btcWalletId,
          memo,
        },
      },
    }

    const {
      data: { data, errors },
    }: { data: LN_NO_AMOUNT_INVOICE_CREATE_RESPONSE } = await axios.post(
      endpoint,
      query,
      {
        headers: defaultHeaders,
      },
    )
    const errs = errors || data.lnNoAmountInvoiceCreate.errors
    if (errs && errs.length) {
      return new Error(errs[0].message || JSON.stringify(errs))
    }

    const {
      lnNoAmountInvoiceCreate: {
        invoice: { paymentRequest, paymentHash, paymentSecret },
      },
    } = data

    return { paymentRequest, paymentHash, paymentSecret }
  }

  return {
    balance,
    fetchTransactionsPage,
    sendLnPayment,
    sendLnPaymentWithAmount,
    createWithAmountLnInvoice,
    createNoAmountLnInvoice,
  }
}
