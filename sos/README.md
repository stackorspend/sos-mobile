# StackorSpend

This repo is the backend / application logic code to run the [StackorSpend app](https://stackorspend.com). It is designed roughly as an API that can eventually be both hosted on and called from React Native code in the frontend. This is possible because the app will use an on-device SQLite database to start with.

The first iteration of this service will be built on the Galoy backend. It can be used to import and analyze wallets like the Bitcoin Beach or Bitcoin Jungle wallets.

The key functions are exposed here as a top-level API of sorts. The frontend will be able to:

- sync with transactions from source, and execute all relevant stack price calculations
- fetch the current stack price
- fetch data about whether an upcoming stack is good or not
- fetch data about whether an upcoming spen is good or not
- send/receive via Lightning
- send/receive via onchain

## API overview

The finished version of the API will look something like the following.

```ts
export const StackorSpend = () => {
  return {
    syncTxns,

    fetchTxns,
    getStackCost,
    checkPlannedStackTxn,
    checkPlannedSpendTxn,

    payNoAmountLnInvoice,
    payWithAmountLnInvoice,
    receiveLnNoAmount,
    receiveLnWithAmount,

    payOnChainAddress,
    receiveOnChain,
  }
}
```

### Running the demo

There is a script in the `index.ts` file of this repo that strings together the completed use-case methods so far to demonstrate some functionality. To see it simply follow these steps:

1. Add the following to a `.env` file

```bash
export API_ENDPOINT="https://api.mainnet.galoy.io/graphql/"
export GALOY_JWT="<your-token-here>"
```

2. Run the following from a terminal

```
$ yarn install
$ yarn demo
```

## Open tasks

- [x] **Store calculated stack price data for transactions in a separate table**

  These are currently calculated inside the `fetchTxns` method.

- [x] **Add pagination for the `fetchTxns` endpoint to be able to call it in descending order in chunks**

  This is currently returned in ascending order because it is also how we do our stack price calcs.

- [x] **Implement simple wrappers for send/receive LN methods**

  Will be a very simple wrapper on the graphql mutations.

- [ ] **Fix calcs to not factor failed txn pairs**

  The aggregates & stack_price_with_pl are already covered by the SELECT (`OVER(ORDER BY timestamp)`). The without_pl calcs need work.

- [ ] **Implement simple wrappers for send/receive onchain methods**

  Will be a very simple wrapper on the graphql mutations. Should be done after onchain-pending txns reconciliation is implemented.
