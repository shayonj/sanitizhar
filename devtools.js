chrome.devtools.panels.create(
  "🔐 SanitizHAR",
  "icon.png",
  "devtools.html",
  function (panel) {
    panel.onShown.addListener(function (window) {
      refreshPage(); // Refresh page to capture HAR when tab is visited
    });
  }
);

document.addEventListener("DOMContentLoaded", function (e) {
  registerLinkHandlers();
  loadHARDetails(); // Initial load when panel is opened

  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    if (
      message.type === "tabUpdated" &&
      message.tabId === chrome.devtools.inspectedWindow.tabId
    ) {
      loadHARDetails();
    }
  });

  // Reload the content and capture HAR when page navigates
  chrome.devtools.network.onNavigated.addListener(() => {
    loadHARDetails();
  });

  document
    .getElementById("downloadButton")
    .addEventListener("click", downloadSanitizedHAR);
});

function registerLinkHandlers() {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function (onclickEvent) {
        onclickEvent.preventDefault();
        chrome.tabs.create({ active: true, url: location });
      };
    })();
  }
}

function refreshPage() {
  const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
  chrome.tabs.reload(inspectedTabId, {}, function () {});
}

function loadHARDetails() {
  chrome.devtools.network.getHAR(function (result) {
    let uniqueHeaders = new Set();
    let uniqueCookies = new Set();
    let uniqueQueryParams = new Set();

    result.entries.forEach((entry) => {
      entry.request.headers.forEach((h) => uniqueHeaders.add(h.name));
      entry.request.cookies.forEach((c) => uniqueCookies.add(c.name));
      entry.request.queryString.forEach((q) => uniqueQueryParams.add(q.name));
    });

    displayData("headers-section", Array.from(uniqueHeaders));
    displayData("cookies-section", Array.from(uniqueCookies));
    displayData("query-params-section", Array.from(uniqueQueryParams));
  });
}

function displayData(sectionId, data) {
  const section = document.getElementById(sectionId);
  section.innerHTML = "";

  // Determine the number of columns, with a max of 4
  const columnCount = Math.min(data.length, 4);
  section.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

  data.forEach((itemName, index) => {
    const itemDiv = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = itemName;

    const checkboxId = `${sectionId}-checkbox-${index}`;
    checkbox.id = checkboxId;

    const label = document.createElement("label");
    label.textContent = itemName;
    label.setAttribute("for", checkboxId);

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    section.appendChild(itemDiv);
  });
}

function downloadSanitizedHAR() {
  chrome.devtools.network.getHAR(function (result) {
    const checkedItems = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    result.entries.forEach((entry) => {
      entry.request.headers = sanitizeData(entry.request.headers, checkedItems);
      entry.request.cookies = sanitizeData(entry.request.cookies, checkedItems);
      entry.request.queryString = sanitizeData(
        entry.request.queryString,
        checkedItems
      );
    });
    result = { log: result };

    const blob = new Blob([JSON.stringify(result)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sanitized.har";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function sanitizeData(data, checkedItems) {
  data.forEach((item) => {
    if (checkedItems.includes(item.name)) {
      item.value = "[sanitized]";
    }
  });
  return data;
}
