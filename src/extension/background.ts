import { PLATFORMS, sleep, startPolling, STRATEGIES } from 'src/lib'

interface Message {
  type: string
  data: {
    platforms: {
      [PLATFORMS.PancakeSwap]: boolean
      [PLATFORMS.CandleGenieBTC]: boolean
      [PLATFORMS.CandleGenieBNB]: boolean
      [PLATFORMS.CandleGenieETH]: boolean
    }
    strategy: STRATEGIES
  }
}

chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === 'START') {
    const { privateKey, betAmount } = await chrome.storage.sync.get([
      'privateKey',
      'betAmount'
    ])

    if (message.data.platforms[PLATFORMS.PancakeSwap]) {
      startPolling(
        privateKey,
        betAmount,
        message.data.strategy,
        true,
        PLATFORMS.PancakeSwap
      ).catch()
      await sleep(3000)
    }

    if (message.data.platforms[PLATFORMS.CandleGenieBTC]) {
      startPolling(
        privateKey,
        betAmount,
        message.data.strategy,
        true,
        PLATFORMS.CandleGenieBTC
      ).catch()
      await sleep(3000)
    }

    if (message.data.platforms[PLATFORMS.CandleGenieBNB]) {
      startPolling(
        privateKey,
        betAmount,
        message.data.strategy,
        true,
        PLATFORMS.CandleGenieBNB
      ).catch()
      await sleep(3000)
    }

    if (message.data.platforms[PLATFORMS.CandleGenieETH]) {
      startPolling(
        privateKey,
        betAmount,
        message.data.strategy,
        true,
        PLATFORMS.CandleGenieETH
      ).catch()
    }
  }
})
