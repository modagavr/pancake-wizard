console.log("background.js");

interface Message {
  type: string;
  value: string;
}

chrome.runtime.onMessage.addListener((message: Message) => {
  console.log(message);
});
