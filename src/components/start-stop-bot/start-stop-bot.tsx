import { useStore } from '@nanostores/react'

import { botEnabledAtom, isAddressZeroAtom } from '~/lib/atoms'
import { startBot } from '~/lib/start-bot'

export default function StartStopBot() {
  const botEnabled = useStore(botEnabledAtom)

  const isAddressZero = useStore(isAddressZeroAtom)

  return (
    <button
      className="btn-primary btn w-full"
      onClick={() => {
        if (botEnabled) {
          botEnabledAtom.set(false)
        } else {
          botEnabledAtom.set(true)
          startBot()
        }
      }}
      disabled={isAddressZero}
    >
      {botEnabled ? 'Stop' : 'Start'}
    </button>
  )
}
