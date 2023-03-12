import { parseEther } from '@ethersproject/units'
import { Wallet } from 'ethers'

import { betAmountAtom } from './atoms'
import { calculateIsBullish } from './calculate-is-bullish'
import { createPancakePredictionContract } from './pancake-prediction-contract-config'

export const checkAndBet = async (signer: Wallet) => {
  const pancakePredictionContract = createPancakePredictionContract(signer)

  const currentEpoch = await pancakePredictionContract.currentEpoch()

  const { amount: currentAmount } = await pancakePredictionContract.ledger(
    currentEpoch,
    signer.address
  )

  const isEntered = currentAmount.gt(0)

  if (isEntered) {
    return
  }

  let isBullish = true

  try {
    isBullish = await calculateIsBullish()
  } catch {
    /* empty */
  }

  const betTx = await pancakePredictionContract[
    isBullish ? 'betBull' : 'betBear'
  ](currentEpoch, {
    value: parseEther(betAmountAtom.get())
  })

  await betTx.wait()

  return `Epoch: ${currentEpoch}. Successfully Entered for ${betAmountAtom.get()} BNB ${
    isBullish ? 'Bullish' : 'Bearish'
  }.`
}
