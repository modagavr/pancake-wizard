// Global Config
const BNBPP_ADDRESS = "0x516ffd7d1e0ca40b1879935b2de87cb20fc1124b";
const AMOUNT_TO_BET = process.env.BET_AMOUNT || "0.1"; // in BNB

import dotenv from "dotenv";

import { formatEther, parseEther } from "@ethersproject/units";
import { ethers } from "ethers";

import { BNBPP_ABI } from "./bnbpp-abi.js";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const bnbppContract = new ethers.Contract(BNBPP_ADDRESS, BNBPP_ABI, signer);

// Utility Function to use **await sleep(ms)**
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("Starting. Amount to bet:", AMOUNT_TO_BET);

bnbppContract.on("StartRound", async (epoch) => {
  console.log("Started Epoch", +epoch);

  // Waiting for 282sec = 4.7min
  await sleep(282000);

  console.log("Getting Amounts");

  const { bullAmount, bearAmount } = await bnbppContract.rounds(epoch);

  console.log("Bull Amount", formatEther(bullAmount), "BNB");
  console.log("Bear Amount", formatEther(bearAmount), "BNB");

  // Betting on Bear if BullAmount > BearAmount but Coefficient is Less Than 6
  const bearBet =
    (+bullAmount > +bearAmount && +bullAmount / +bearAmount < 5) ||
    (+bullAmount < +bearAmount && +bearAmount / +bullAmount > 5);

  console.log("Betting on", bearBet ? "Bear" : "Bull");

  console.log("Betting is Started");

  if (bearBet) {
    const tx = await bnbppContract.betBear({
      value: parseEther(AMOUNT_TO_BET),
    });

    console.log("Bear Betting Tx Started");

    try {
      await tx.wait();

      console.log("Bear Betting Tx Success");
    } catch {
      console.log("Bear Betting Tx Error");
    }
  } else {
    const tx = await bnbppContract.betBull({
      value: parseEther(AMOUNT_TO_BET),
    });

    console.log("Bull Betting Tx Started");

    try {
      await tx.wait();

      console.log("Bull Betting Tx Success");
    } catch {
      console.log("Bull Betting Tx Error");
    }
  }

  for (let i = 1; i <= 5; i++) {
    const prevEpoch = parseInt(epoch) - i;
    const [claimable, refundable, {claimed, amount}] = await Promise.all([
      bnbppContract.claimable(prevEpoch, signer.address),
      bnbppContract.refundable(prevEpoch, signer.address),
      bnbppContract.ledger(prevEpoch, signer.address)
    ]);

    if (amount.toString() === '0') {
      continue;
    }

    if ((claimable || refundable) && !claimed) {
      const tx = await bnbppContract.claim(prevEpoch);
      console.log("Claim Tx Started");
      try {
        await tx.wait();
        console.log("Claim Tx Success");
      } catch {
        console.log("Claim Tx Error");
      }
    }
  }
});
