// sanitizer.js

export function sanitizeHARData(result, checkedItems) {
  result.entries.forEach((entry) => {
    entry.request.headers = sanitizeData(entry.request.headers, checkedItems);
    entry.request.cookies = sanitizeData(entry.request.cookies, checkedItems);
    entry.request.queryString = sanitizeData(
      entry.request.queryString,
      checkedItems
    );
  });
  return { log: result };
}

function sanitizeData(data, checkedItems) {
  data.forEach((item) => {
    if (checkedItems.includes(item.name)) {
      item.value = "[sanitized]";
    }
  });
  return data;
}
