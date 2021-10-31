import { Heading, ListItem, OrderedList } from "@chakra-ui/layout";
import React from "react";
import { PLATFORMS } from "src/lib";

export default function Info({
  platform = PLATFORMS.PancakeSwap,
}: {
  platform?: PLATFORMS;
}) {
  return (
    <>
      <Heading fontSize="lg">{platform} Prediction Winner 🚀</Heading>
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
        <ListItem>Good Luck!</ListItem>
      </OrderedList>
    </>
  );
}
