import { persistentAtom } from '@nanostores/persistent'
import { constants, Wallet } from 'ethers'
import { atom, computed } from 'nanostores'
import { Address } from 'wagmi'

export const botEnabledAtom = atom(false)

export const betAmountAtom = persistentAtom<`${number}`>('betAmount', '0.1')

export const privateKeyAtom = persistentAtom<string>('privateKey', '')

export const addressAtom = computed(privateKeyAtom, (privateKey) => {
  {
    try {
      return new Wallet(privateKey).address as Address
    } catch {
      return constants.AddressZero as Address
    }
  }
})

export const isAddressZeroAtom = computed(
  addressAtom,
  (address) => address === constants.AddressZero
)
