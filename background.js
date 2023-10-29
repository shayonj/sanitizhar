chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.runtime.sendMessage({ type: "tabUpdated", tabId: tabId });
  }
});
