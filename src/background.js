chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.runtime.sendMessage({ type: "tabUpdated", tabId });
  }
});
