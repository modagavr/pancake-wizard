import { PLATFORMS, sleep, startPolling, STRATEGIES } from "src/lib";

interface Message {
  type: string;
  data: {
    [PLATFORMS.PancakeSwap]: boolean;
    [PLATFORMS.CandleGenieBTC]: boolean;
    [PLATFORMS.CandleGenieBNB]: boolean;
    [PLATFORMS.CandleGenieETH]: boolean;
  };
}

chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === "START") {
    const { privateKey, betAmount } = await chrome.storage.sync.get([
      "privateKey",
      "betAmount",
    ]);

    if (message.data[PLATFORMS.PancakeSwap]) {
      startPolling(
        privateKey,
        betAmount,
        STRATEGIES.Standard,
        true,
        PLATFORMS.PancakeSwap
      ).catch();
      await sleep(3000);
    }

    if (message.data[PLATFORMS.CandleGenieBTC]) {
      startPolling(
        privateKey,
        betAmount,
        STRATEGIES.Standard,
        true,
        PLATFORMS.CandleGenieBTC
      ).catch();
      await sleep(3000);
    }

    if (message.data[PLATFORMS.CandleGenieBNB]) {
      startPolling(
        privateKey,
        betAmount,
        STRATEGIES.Standard,
        true,
        PLATFORMS.CandleGenieBNB
      ).catch();
      await sleep(3000);
    }

    if (message.data[PLATFORMS.CandleGenieETH]) {
      startPolling(
        privateKey,
        betAmount,
        STRATEGIES.Standard,
        true,
        PLATFORMS.CandleGenieETH
      ).catch();
    }
  }
});
