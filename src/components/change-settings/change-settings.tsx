import { Dialog } from '@headlessui/react'
import { useStore } from '@nanostores/react'
import clsx from 'clsx'
import { useState } from 'react'

import { betAmountAtom, isAddressZeroAtom, privateKeyAtom } from '~/lib/atoms'

export default function ChangeSettings() {
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false)
  const [localPrivateKey, setLocalPrivateKey] = useState('')

  const isAddressZero = useStore(isAddressZeroAtom)

  const [isBetAmountModalOpen, setIsBetAmountModalOpen] = useState(false)
  const [localBetAmount, setLocalBetAmount] = useState('')

  return (
    <>
      <div className="btn-group w-full">
        <button
          className={clsx(
            'btn-primary btn-sm btn w-1/2',
            isAddressZero ? '' : 'btn-outline'
          )}
          onClick={() => setIsPrivateKeyModalOpen(true)}
        >
          {isAddressZero ? 'Setup Account' : 'Change Account'}
        </button>

        <button
          className="btn-outline btn-primary btn-sm btn w-1/2"
          onClick={() => setIsBetAmountModalOpen(true)}
        >
          Change Bet Amount
        </button>
      </div>

      <Dialog
        open={isPrivateKeyModalOpen}
        onClose={() => setIsPrivateKeyModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="modal-box">
            <h3 className="text-lg font-bold">
              Enter your wallet&apos;s private key
            </h3>
            <p>Your private key is stored locally</p>

            <input
              type="text"
              className="input-bordered input mt-6 w-full"
              placeholder="PRIVATE KEY"
              value={localPrivateKey}
              onChange={(e) => setLocalPrivateKey(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">
                64 characters long. Example:{' '}
                <span className="font-mono">1a2b3c...d8c9e0</span>
              </span>
            </label>

            <div className="modal-action">
              <button
                className="btn-primary btn w-full"
                disabled={![64, 66].includes(localPrivateKey.length)}
                onClick={() => {
                  privateKeyAtom.set(localPrivateKey)
                  setIsPrivateKeyModalOpen(false)
                  setLocalPrivateKey('')
                }}
              >
                SET
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={isBetAmountModalOpen}
        onClose={() => setIsBetAmountModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="modal-box">
            <h3 className="text-lg font-bold">Enter Bet Amount</h3>
            <p>in BNB</p>

            <input
              type="number"
              className="input-bordered input mt-6 w-full"
              placeholder="0.1"
              value={localBetAmount}
              onChange={(e) => setLocalBetAmount(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">
                Only number. Example: <span className="font-mono">0.1</span>
              </span>
            </label>

            <div className="modal-action">
              <button
                className="btn-primary btn w-full"
                disabled={localBetAmount === ''}
                onClick={() => {
                  betAmountAtom.set(`${parseFloat(localBetAmount)}`)
                  setIsBetAmountModalOpen(false)
                  setLocalBetAmount('')
                }}
              >
                SET
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
