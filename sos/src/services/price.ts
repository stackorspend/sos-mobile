import ccxt from "ccxt"

const main = async () => {
  const bitstamp = new ccxt.bitstamp
  console.log('Fetching ticker...')
  const ticker = await bitstamp.fetchTicker("BTC/USD")
  return ticker.last
}

export default main
