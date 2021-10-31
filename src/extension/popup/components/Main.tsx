import { Button } from "@chakra-ui/button";
import { useBoolean } from "@chakra-ui/hooks";
import { LockIcon, PlusSquareIcon, StarIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/input";
import { Box, HStack, Text } from "@chakra-ui/layout";
import { Wallet } from "@ethersproject/wallet";
import React, { useEffect, useState } from "react";
import { LogMessage, PLATFORMS, sleep } from "src/lib";
import Config from "./Config";
import Info from "./Info";

export default function Main() {
  const [privateKey, setPrivateKey] = useState("");
  const [betAmount, setBetAmount] = useState("0.1");
  const [storageBetAmount, setStorageBetAmount] = useState("");
  const [address, setAddress] = useState("");

  const [fetchFlag, setFetchFlag] = useBoolean();

  const [logs, setLogs] = useState<LogMessage[]>();

  const [platform, setPlatform] = useState(PLATFORMS.PancakeSwap);

  useEffect(() => {
    chrome.storage.sync
      .get(["privateKey", "betAmount", "logs", "platform"])
      .then(({ privateKey, betAmount, logs, platform }) => {
        setAddress(new Wallet(privateKey).address);

        setBetAmount(betAmount);
        setStorageBetAmount(betAmount);

        setLogs(logs);

        if (platform) {
          setPlatform(platform);
        }
      });
  }, [fetchFlag]);

  return (
    <>
      <Button
        mb="4"
        size="sm"
        onClick={() => {
          chrome.storage.sync
            .set({
              platform:
                platform === PLATFORMS.CandleGenie
                  ? "PancakeSwap"
                  : "CandleGenie",
            })
            .then(() => setFetchFlag.toggle());
        }}
      >
        Switch to{" "}
        {platform === PLATFORMS.CandleGenie ? "PancakeSwap" : "CandleGenie"}
      </Button>

      <Info platform={platform} />

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
                .then(() => setFetchFlag.toggle());
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
                .then(() => setFetchFlag.toggle());
            }}
          >
            Set
          </Button>
        </HStack>

        <Button
          onClick={async () => {
            chrome.runtime.sendMessage({ type: "START", data: "" });

            await sleep(100);
            setFetchFlag.toggle();
          }}
          w="full"
          size="lg"
          colorScheme="blue"
          leftIcon={<StarIcon />}
        >
          Start The Bot
        </Button>

        <Button
          onClick={async () => {
            chrome.storage.sync.set({ logs: [] }).then(setFetchFlag.toggle);
          }}
          size="xs"
        >
          Clear Logs
        </Button>

        {logs?.map((log, index) => (
          <Text key={index} textColor={log.color + ".300"}>
            {log.text}
          </Text>
        ))}
      </Box>
    </>
  );
}
