import { toast } from 'react-hot-toast'

import { botEnabledAtom } from './atoms'
import { checkAndBet } from './check-and-bet'
import { checkAndClaim } from './check-and-claim'
import { notify } from './notify'
import { createSigner } from './signer'
import { sleep } from './utils'

export const startBot = async () => {
  while (botEnabledAtom.get()) {
    try {
      const signer = createSigner()

      const betMessage = await checkAndBet(signer)

      if (betMessage) {
        toast.success(betMessage)

        notify(betMessage)
      }

      const claimMessage = await checkAndClaim(signer)

      if (claimMessage) {
        toast.success(claimMessage)

        notify(claimMessage)
      }
    } catch (e) {
      const reason = (e as { error?: { reason?: string } }).error?.reason

      toast(reason ?? 'unexpected error')

      console.error(e)
    }

    await sleep(30000)
  }
}
