import { sanitizeHARData } from "../sanitizer";

describe("sanitizeHARData", () => {
  it("should sanitize specified headers, cookies, and query parameters", () => {
    const mockHARData = {
      entries: [
        {
          request: {
            headers: [
              { name: "token", value: "secretToken" },
              { name: "content-type", value: "application/json" }
            ],
            cookies: [{ name: "session", value: "secretSession" }],
            queryString: [{ name: "apiKey", value: "secretKey" }]
          }
        }
      ]
    };

    const checkedItems = ["token", "session"];
    sanitizeHARData(mockHARData, checkedItems).then((sanitizedData) => {
      expect(sanitizedData).toEqual({
        log: {
          entries: [
            {
              request: {
                headers: [
                  { name: "token", value: "[sanitized]" },
                  { name: "content-type", value: "application/json" }
                ],
                cookies: [{ name: "session", value: "[sanitized]" }],
                queryString: [{ name: "apiKey", value: "secretKey" }]
              }
            }
          ]
        }
      });
    });
  });
});
