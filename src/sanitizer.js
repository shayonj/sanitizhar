export async function sanitizeHARData(result, checkedItems) {
  let promises = [];
  await result.entries.forEach((entry) => {
    entry.request.headers = sanitizeData(entry.request.headers, checkedItems);
    entry.request.cookies = sanitizeData(entry.request.cookies, checkedItems);
    entry.request.queryString = sanitizeData(
      entry.request.queryString,
      checkedItems
    );

    if (entry.response) {
      entry.response.headers = sanitizeData(
        entry.response.headers,
        checkedItems
      );
      if (entry.response.cookies) {
        entry.response.cookies = sanitizeData(
          entry.response.cookies,
          checkedItems
        );
      }
      promises.push( new Promise(
        (resolve) => {
          entry.getContent((content) => {
            entry.response.content.text = content;
            resolve();
          });
        })
      );
    }
  });

  await Promise.all(promises);
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
