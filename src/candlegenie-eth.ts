import dotenv from 'dotenv'

import { parseStrategy, PLATFORMS, startPolling } from './lib'

dotenv.config()

const strategy = parseStrategy(process.argv)

startPolling(
  process.env.PRIVATE_KEY,
  process.env.BET_AMOUNT,
  strategy,
  false,
  PLATFORMS.CandleGenieETH
).catch((error) => {
  console.error(error)
})
