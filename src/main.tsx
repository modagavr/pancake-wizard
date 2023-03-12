import '~/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { WagmiConfig } from 'wagmi'

import App from '~/App'
import { wagmiClient } from '~/lib/wagmi-client'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WagmiConfig client={wagmiClient}>
      <App />

      <Toaster position="bottom-right" />
    </WagmiConfig>
  </StrictMode>
)
