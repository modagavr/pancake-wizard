import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from 'ethers'
import { bsc } from 'wagmi/chains'

import { privateKeyAtom } from './atoms'

const provider = new JsonRpcProvider(bsc.rpcUrls.default.http[0])

export const createSigner = () => new Wallet(privateKeyAtom.get(), provider)
