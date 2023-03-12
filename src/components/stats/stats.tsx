import { formatEther } from '@ethersproject/units'
import { useStore } from '@nanostores/react'
import { GearIcon } from '@radix-ui/react-icons'
import { constants } from 'ethers'
import { useEffect } from 'react'
import { useBalance, useContractRead } from 'wagmi'

import {
  addressAtom,
  betAmountAtom,
  botEnabledAtom,
  isAddressZeroAtom
} from '~/lib/atoms'
import { pancakePredictionContractConfig } from '~/lib/pancake-prediction-contract-config'
import { shortenAddress } from '~/lib/utils'

export default function Stats() {
  const botEnabled = useStore(botEnabledAtom)
  const betAmount = useStore(betAmountAtom)
  const address = useStore(addressAtom)
  const isAddressZero = useStore(isAddressZeroAtom)

  const balanceQuery = useBalance({
    address,
    enabled: !isAddressZero
  })

  const currentEpochQuery = useContractRead({
    ...pancakePredictionContractConfig,
    functionName: 'currentEpoch'
  })

  const currentEpochUserInfoQuery = useContractRead({
    ...pancakePredictionContractConfig,
    functionName: 'ledger',
    args: [currentEpochQuery.data ?? constants.Zero, address],
    enabled: currentEpochQuery.data !== undefined
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      balanceQuery.refetch()
      currentEpochQuery.refetch().then(() => {
        currentEpochUserInfoQuery.refetch()
      })
    }, 15000)

    return () => clearInterval(intervalId)
  }, [balanceQuery, currentEpochQuery, currentEpochUserInfoQuery])

  return (
    <div className="stats stats-vertical w-full border border-gray-700">
      <div className="stat">
        <div className="stat-title">Current Status</div>
        <div className="stat-value">{botEnabled ? 'Enabled' : 'Disabled'}</div>
        <div className="stat-desc font-bold text-secondary">
          {botEnabled ? (
            <div className="flex items-center space-x-1">
              <GearIcon className="animate-spin" />
              <span>THE BOT IS WORKING. DON&apos;T CLAIM REWARDS MANUALLY</span>
            </div>
          ) : isAddressZero ? (
            'CLICK ON [SETUP ACCOUNT]'
          ) : (
            'CLICK ON [START] TO START THE BOT'
          )}
        </div>
      </div>

      <div className="stat">
        <div className="stat-title">Bet Amount</div>
        <div className="stat-value">{betAmount} BNB</div>
      </div>

      <div className="stat">
        <div className="stat-title">Address</div>
        <div className="stat-value">{shortenAddress(address)}</div>
      </div>

      <div className="stat">
        <div className="stat-title">Balance</div>
        <div className="stat-value">
          {isAddressZero
            ? '0.000'
            : parseFloat(balanceQuery.data?.formatted ?? '0').toFixed(3)}{' '}
          BNB
        </div>
      </div>

      <div className="stat">
        <div className="stat-title">
          Round #{currentEpochQuery.data?.toNumber()}
        </div>
        <div className="stat-value">
          {formatEther(currentEpochUserInfoQuery.data?.amount ?? 0)} BNB
        </div>
        <div className="stat-desc">
          {currentEpochUserInfoQuery.data?.amount.isZero()
            ? 'Direction will be shown here'
            : currentEpochUserInfoQuery.data?.position === 0
            ? 'Bull'
            : 'Bear'}
        </div>
      </div>
    </div>
  )
}
