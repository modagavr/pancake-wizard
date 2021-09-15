import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { PancakePredictionV2 } from "./types/typechain";

export const isBearBet = (bullAmount: BigNumber, bearAmount: BigNumber) =>
  ((bullAmount.gt(bearAmount) && bullAmount.div(bearAmount).lt(5)) ||
    (bullAmount.lt(bearAmount) && bearAmount.div(bullAmount).gt(5))) &&
  Math.random() < 0.8;

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

export const calculateTaxAmount = (amount: BigNumber | undefined) => {
  if (!amount || amount.div(50).lt(parseEther("0.005"))) {
    return parseEther("0.005");
  }

  return amount.div(50);
};
