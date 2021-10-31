import { startPolling, STRATEGIES } from "src/lib";

interface Message {
  type: string;
  data: string;
}

chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === "START") {
    const { privateKey, betAmount, platform } = await chrome.storage.sync.get([
      "privateKey",
      "betAmount",
      "platform",
    ]);

    startPolling(privateKey, betAmount, STRATEGIES.Standard, true, platform);
  }
});
