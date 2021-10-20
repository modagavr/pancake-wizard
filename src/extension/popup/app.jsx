import { Button } from "@chakra-ui/button";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { LockIcon, PlusSquareIcon, StarIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/input";
import { Box, Heading, HStack, ListItem, OrderedList } from "@chakra-ui/layout";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import React, { useState } from "react";
import ReactDOM from "react-dom";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function App() {
  const [privateKey, setPrivateKey] = useState("");
  const [betAmount, setBetAmount] = useState(0.1);

  return (
    <ChakraProvider theme={theme}>
      <Box p="4" w="lg" experimental_spaceY="2">
        <Heading fontSize="lg">PancakeSwap Prediction Winner 🚀</Heading>
        <OrderedList>
          <ListItem>
            Enter your private key to the input field. Your private key is
            securely stored on your local machine.
          </ListItem>
          <ListItem>Press "Set" button to set private key.</ListItem>
          <ListItem>Press "Start The Bot" button to start the bot.</ListItem>
          <ListItem>
            Don't close the browser. You can use any websites, but don't send
            any transaction from your wallet when the bot is working, because
            you can break bot's timer.
          </ListItem>
          <ListItem>Good Luck!</ListItem>
        </OrderedList>

        <HStack>
          <Input
            placeholder="Private Key"
            w="full"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
          <Button
            leftIcon={<LockIcon />}
            onClick={() => {
              chrome.runtime.sendMessage({
                type: "SET_PRIVATEKEY",
                data: privateKey,
              });
            }}
          >
            Set
          </Button>
        </HStack>

        <HStack>
          <InputGroup>
            <InputLeftAddon children="BNB" />
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
              chrome.runtime.sendMessage({
                type: "SET_BETAMOUNT",
                data: betAmount + "",
              });
            }}
          >
            Set
          </Button>
        </HStack>

        <Button
          onClick={() => {
            chrome.runtime.sendMessage({ type: "START", data: "" });
          }}
          w="full"
          size="lg"
          colorScheme="blue"
          leftIcon={<StarIcon />}
        >
          Start The Bot
        </Button>
      </Box>
    </ChakraProvider>
  );
}

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>,
  document.getElementById("root")
);
