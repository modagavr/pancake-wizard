import { Heading, ListItem, OrderedList, Text } from '@chakra-ui/layout'
import React from 'react'

export default function Info() {
  return (
    <>
      <Heading fontSize="lg">
        PancakeSwap & Candle Genie Prediction Winner 🚀
      </Heading>
      <OrderedList>
        <ListItem>
          Enter your private key to the input field. Your private key is
          securely stored on your local machine.
        </ListItem>
        <ListItem>Press Set button to set private key.</ListItem>
        <ListItem>Press Start The Bot button to start the bot.</ListItem>
        <ListItem>
          Don&apos;t close the browser. You can use any websites, but don&apos;t
          send any transaction from your wallet when the bot is working, because
          you can break bot&apos;s timer.
        </ListItem>
        <ListItem>Bot will automatically claim all your profit.</ListItem>
        <ListItem>
          <Text as="span" textDecor="underline">
            IMPORTANT!
          </Text>{' '}
          Open Extensions -&gt; PancakeSwap Prediction Winner -&gt; Developer
          Mode ON -&gt; service worker. Otherwise the bot will sleep.
        </ListItem>
        <ListItem>Good Luck!</ListItem>
      </OrderedList>
    </>
  )
}
