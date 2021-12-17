import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useBoolean } from '@chakra-ui/hooks'
import {
  CheckIcon,
  CloseIcon,
  LockIcon,
  PlusSquareIcon,
  StarIcon
} from '@chakra-ui/icons'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import { Box, Flex, HStack, Link, Text } from '@chakra-ui/layout'
import { Switch } from '@chakra-ui/switch'
import { Wallet } from '@ethersproject/wallet'
import React, { useEffect, useState } from 'react'
import { LogMessage, PLATFORMS, sleep, STRATEGIES } from 'src/lib'

import Config from './Config'
import Info from './Info'

export default function Main() {
  const [privateKey, setPrivateKey] = useState('')
  const [betAmount, setBetAmount] = useState('0.1')
  const [storageBetAmount, setStorageBetAmount] = useState('')
  const [address, setAddress] = useState('')

  const [strategy, setStrategy] = useState(false)

  const [fetchFlag, setFetchFlag] = useBoolean()

  const [logs, setLogs] = useState<LogMessage[]>()

  const [platforms, setPlatforms] = useState({
    [PLATFORMS.PancakeSwap]: true,
    [PLATFORMS.CandleGenieBTC]: true,
    [PLATFORMS.CandleGenieBNB]: true,
    [PLATFORMS.CandleGenieETH]: true
  })

  useEffect(() => {
    chrome.storage.sync
      .get(['privateKey', 'betAmount', 'logs'])
      .then(({ privateKey, betAmount, logs }) => {
        try {
          setAddress(new Wallet(privateKey).address)
        } catch {
          console.log('Invalid Private Key')
        }

        setBetAmount(betAmount)
        setStorageBetAmount(betAmount)

        setLogs(logs)
      })
  }, [fetchFlag])

  useEffect(() => {
    chrome.storage.onChanged.addListener(({ privateKey, betAmount, logs }) => {
      privateKey && setPrivateKey(privateKey.newValue)

      betAmount && setStorageBetAmount(betAmount.newValue)

      logs && setLogs(logs.newValue)
    })
  }, [])

  return (
    <>
      <HStack justify="space-between" mb="4">
        <Button
          size="sm"
          colorScheme="blue"
          variant={platforms[PLATFORMS.PancakeSwap] ? 'solid' : 'outline'}
          leftIcon={
            platforms[PLATFORMS.PancakeSwap] ? <CheckIcon /> : <CloseIcon />
          }
          onClick={() =>
            setPlatforms((p) => ({
              ...p,
              [PLATFORMS.PancakeSwap]: !p[PLATFORMS.PancakeSwap]
            }))
          }
        >
          {PLATFORMS.PancakeSwap}
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          variant={platforms[PLATFORMS.CandleGenieBTC] ? 'solid' : 'outline'}
          leftIcon={
            platforms[PLATFORMS.CandleGenieBTC] ? <CheckIcon /> : <CloseIcon />
          }
          onClick={() =>
            setPlatforms((p) => ({
              ...p,
              [PLATFORMS.CandleGenieBTC]: !p[PLATFORMS.CandleGenieBTC]
            }))
          }
        >
          {PLATFORMS.CandleGenieBTC}
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          variant={platforms[PLATFORMS.CandleGenieBNB] ? 'solid' : 'outline'}
          leftIcon={
            platforms[PLATFORMS.CandleGenieBNB] ? <CheckIcon /> : <CloseIcon />
          }
          onClick={() =>
            setPlatforms((p) => ({
              ...p,
              [PLATFORMS.CandleGenieBNB]: !p[PLATFORMS.CandleGenieBNB]
            }))
          }
        >
          {PLATFORMS.CandleGenieBNB}
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          variant={platforms[PLATFORMS.CandleGenieETH] ? 'solid' : 'outline'}
          leftIcon={
            platforms[PLATFORMS.CandleGenieETH] ? <CheckIcon /> : <CloseIcon />
          }
          onClick={() =>
            setPlatforms((p) => ({
              ...p,
              [PLATFORMS.CandleGenieETH]: !p[PLATFORMS.CandleGenieETH]
            }))
          }
        >
          {PLATFORMS.CandleGenieETH}
        </Button>
      </HStack>

      <FormControl display="flex" alignItems="center" mb="4">
        <FormLabel mb="0" w="44">
          Strategy: {strategy ? 'Experimental' : 'Standard'}
        </FormLabel>
        <Switch isChecked={strategy} onChange={() => setStrategy(!strategy)} />
      </FormControl>

      <Info />

      <Box mt="8" experimental_spaceY="2">
        <Config address={address} betAmount={storageBetAmount} />
        <HStack mt="4">
          <Input
            placeholder="Private Key"
            type="password"
            w="full"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />

          <Button
            leftIcon={<LockIcon />}
            onClick={() => {
              chrome.storage.sync
                .set({ privateKey })
                .then(() => setFetchFlag.toggle())
            }}
          >
            Set
          </Button>
        </HStack>

        <HStack>
          <InputGroup>
            <InputLeftAddon>BNB</InputLeftAddon>
            <Input
              type="number"
              placeholder="BNB Amount"
              w="full"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
          </InputGroup>
          <Button
            leftIcon={<PlusSquareIcon />}
            onClick={() => {
              chrome.storage.sync
                .set({ betAmount })
                .then(() => setFetchFlag.toggle())
            }}
          >
            Set
          </Button>
        </HStack>

        <Button
          onClick={async () => {
            chrome.runtime.sendMessage({
              type: 'START',
              data: {
                platforms,
                strategy: strategy
                  ? STRATEGIES.Experimental
                  : STRATEGIES.Standard
              }
            })

            await sleep(100)
            setFetchFlag.toggle()
          }}
          w="full"
          size="lg"
          colorScheme="blue"
          leftIcon={<StarIcon />}
        >
          Start The Bot
        </Button>

        <Flex align="center" justify="center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="16"
            height="16"
          >
            <path
              fill="#1DA1F2"
              d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
            />
          </svg>
          <Link
            ml="2"
            href="https://twitter.com/modagavr"
            isExternal
            fontSize="sm"
          >
            @modagavr 😼🤝😼 Egor Gavrilov
          </Link>
        </Flex>

        <Button
          onClick={async () => {
            chrome.storage.sync.set({ logs: [] }).then(setFetchFlag.toggle)
          }}
          size="xs"
          w="full"
          variant="outline"
        >
          Clear Logs
        </Button>

        {logs?.map((log, index) => (
          <Text key={index} textColor={log.color + '.300'}>
            {log.text}
          </Text>
        ))}
      </Box>
    </>
  )
}
