import { configureChains, createClient } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const { provider } = configureChains([bsc], [publicProvider()])

export const wagmiClient = createClient({
  provider
})
