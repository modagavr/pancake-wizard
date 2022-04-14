import dotenv from 'dotenv'

import { parseStrategy, PLATFORMS, sleep, startPolling } from './lib'

dotenv.config()

const strategy = parseStrategy(process.argv)

async function main() {
  startPolling(
    process.env.PRIVATE_KEY,
    process.env.BET_AMOUNT,
    strategy,
    false,
    PLATFORMS.PancakeSwap
  )

  await sleep(3000)

  startPolling(
    process.env.PRIVATE_KEY,
    process.env.BET_AMOUNT,
    strategy,
    false,
    PLATFORMS.DogeBets
  )
}

main().catch((error) => {
  console.error(error)
})
