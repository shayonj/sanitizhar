import { sanitizeHARData } from "./sanitizer";

chrome.devtools.panels.create(
  "🔐 SanitizHAR",
  "icon.png",
  "devtools.html",
  (panel) => {
    panel.onShown.addListener(() => {
      refreshPage(); // Refresh page to capture HAR when tab is visited
    });
  }
);

document.addEventListener("DOMContentLoaded", () => {
  registerLinkHandlers();
  // loadHARDetails(); // Initial load when panel is opened

  chrome.runtime.onMessage.addListener((message) => {
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

  attachDownloadListener();
});

function registerLinkHandlers() {
  const links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      const ln = links[i];
      const location = ln.href;
      ln.onclick = function (onclickEvent) {
        onclickEvent.preventDefault();
        chrome.tabs.create({ active: true, url: location });
      };
    })();
  }
}

function refreshPage() {
  const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
  chrome.tabs.reload(inspectedTabId, {}, () => {});
}

function loadHARDetails() {
  chrome.devtools.network.getHAR((result) => {
    const uniqueHeaders = new Set();
    const uniqueCookies = new Set();
    const uniqueQueryParams = new Set();

    result.entries.forEach((entry) => {
      // For request
      entry.request.headers.forEach((h) => uniqueHeaders.add(h.name));
      entry.request.cookies.forEach((c) => uniqueCookies.add(c.name));
      entry.request.queryString.forEach((q) => uniqueQueryParams.add(q.name));

      if (entry.response) {
        entry.response.headers.forEach((h) => uniqueHeaders.add(h.name));
        if (entry.response.cookies) {
          entry.response.cookies.forEach((c) => uniqueCookies.add(c.name));
        }
      }
    });

    displayData("headers-section", Array.from(uniqueHeaders));
    displayData("cookies-section", Array.from(uniqueCookies));
    displayData("query-params-section", Array.from(uniqueQueryParams));
  });
}

function attachDownloadListener() {
  const downloadButton = document.getElementById("downloadButton");

  // Check if the button already has an event listener using a data attribute
  if (!downloadButton.getAttribute("data-listener-attached")) {
    downloadButton.addEventListener("click", downloadSanitizedHAR);
    downloadButton.setAttribute("data-listener-attached", "true");
  }
}

function displayData(sectionId, data) {
  const section = document.getElementById(sectionId);
  section.innerHTML = "";

  // Determine the number of columns, with a max of 3
  const columnCount = Math.min(data.length, 2) + 1; // +1 for the "Select all" checkbox
  section.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

  // Add "Select all" checkbox
  const allItemDiv = document.createElement("div");
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = `${sectionId}-select-all`;

  // Event listener for the "Check all" checkbox
  allCheckbox.addEventListener("change", function () {
    const otherCheckboxes = section.querySelectorAll(
      'input[type="checkbox"]:not(#' + this.id + ")"
    );
    otherCheckboxes.forEach((checkbox) => (checkbox.checked = this.checked));
  });

  const allLabel = document.createElement("label");
  allLabel.textContent = "Select all";
  allLabel.setAttribute("for", allCheckbox.id);

  allItemDiv.appendChild(allCheckbox);
  allItemDiv.appendChild(allLabel);
  section.appendChild(allItemDiv);

  // Add the other checkboxes
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

    // Event listener for individual checkboxes
    checkbox.addEventListener("change", function () {
      if (!this.checked) {
        // If any individual checkbox is unchecked, uncheck the "Select all" checkbox
        allCheckbox.checked = false;
      } else if (
        section.querySelectorAll('input[type="checkbox"]:not(:checked)')
          .length === 1
      ) {
        // If all individual checkboxes are checked, check the "Select all" checkbox
        allCheckbox.checked = true;
      }
    });

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    section.appendChild(itemDiv);
  });
}

function downloadSanitizedHAR() {
  chrome.devtools.network.getHAR((result) => {
    const checkedItems = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    sanitizeHARData(result, checkedItems).then(
      (sanitizedResult) => {
        const blob = new Blob([JSON.stringify(sanitizedResult)], {
          type: "application/json"
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sanitized.har";
        a.click();
        URL.revokeObjectURL(url);
      }
    );
  });
}
