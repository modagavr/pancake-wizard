import { Wallet } from 'ethers'
import { Address } from 'wagmi'

import { PancakePrediction__factory } from '~/types/contracts'

const PANCAKE_PREDICTION_ADDRESS: Address =
  '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA'

const pancakePredictionABI = PancakePrediction__factory.abi

export const pancakePredictionContractConfig = {
  address: PANCAKE_PREDICTION_ADDRESS,
  abi: pancakePredictionABI
}

export const createPancakePredictionContract = (signer: Wallet) =>
  PancakePrediction__factory.connect(PANCAKE_PREDICTION_ADDRESS, signer)
