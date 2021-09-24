import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { underline } from "chalk";
import {
  CandleGeniePredictionV3,
  PancakePredictionV2,
} from "./types/typechain";

// Utility Function to use **await sleep(ms)**
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export enum STRATEGIES {
  Standard = "Standard",
  Experimental = "Experimental",
}

export const parseStrategy = (processArgv: string[]) => {
  const strategy = processArgv.includes("--exp")
    ? STRATEGIES.Experimental
    : STRATEGIES.Standard;

  console.log(underline("Strategy:", strategy));

  if (strategy === STRATEGIES.Standard) {
    console.log(
      "\n You can also use this bot with the new, experimental strategy\n",
      "Start the bot with --exp flag to try it\n",
      underline("npm run start -- --exp"),
      "or",
      underline("yarn start --exp\n")
    );
  }

  return strategy;
};

export const isBearBet = (
  bullAmount: BigNumber,
  bearAmount: BigNumber,
  strategy: STRATEGIES = STRATEGIES.Standard
) => {
  const precalculation =
    (bullAmount.gt(bearAmount) && bullAmount.div(bearAmount).lt(5)) ||
    (bullAmount.lt(bearAmount) && bearAmount.div(bullAmount).gt(5));

  if (strategy === STRATEGIES.Standard) {
    return precalculation;
  }

  if (strategy === STRATEGIES.Experimental) {
    return !precalculation;
  }
};

export const getClaimableEpochs = async (
  predictionContract: PancakePredictionV2,
  epoch: BigNumber,
  userAddress: string
) => {
  const claimableEpochs: BigNumber[] = [];

  for (let i = 1; i <= 5; i++) {
    const epochToCheck = epoch.sub(i);

    const [claimable, refundable, { claimed, amount }] = await Promise.all([
      predictionContract.claimable(epochToCheck, userAddress),
      predictionContract.refundable(epochToCheck, userAddress),
      predictionContract.ledger(epochToCheck, userAddress),
    ]);

    if (amount.gt(0) && (claimable || refundable) && !claimed) {
      claimableEpochs.push(epochToCheck);
    }
  }

  return claimableEpochs;
};

export const reduceWaitingTimeByTwoBlocks = (waitingTime: number) => {
  if (waitingTime <= 6000) {
    return waitingTime;
  }

  return waitingTime - 6000;
};

export const getClaimableEpochsCG = async (
  predictionContract: CandleGeniePredictionV3,
  epoch: BigNumber,
  userAddress: string
) => {
  const claimableEpochs: BigNumber[] = [];

  for (let i = 1; i <= 5; i++) {
    const epochToCheck = epoch.sub(i);

    const [claimable, refundable, { claimed, amount }] = await Promise.all([
      predictionContract.claimable(epochToCheck, userAddress),
      predictionContract.refundable(epochToCheck, userAddress),
      predictionContract.Bets(epochToCheck, userAddress),
    ]);

    if (amount.gt(0) && (claimable || refundable) && !claimed) {
      claimableEpochs.push(epochToCheck);
    }
  }

  return claimableEpochs;
};

export const calculateTaxAmount = (amount: BigNumber | undefined) => {
  if (!amount || amount.div(50).lt(parseEther("0.005"))) {
    return parseEther("0.005");
  }

  return amount.div(50);
};
