# 🔐 SanitizHAR: A simple chrome extension to sanitize HAR file contents

Ever found yourself needing to share a HAR (HTTP Archive) file for debugging but wary of the personal data it might contain? Worry no more! SanitizHAR is here to save your day (and your data).

[Get it at the Chrome Web Store](https://chromewebstore.google.com/detail/sanitizhar/olljgcknknokkfcchffamflmcicapofi)

## What's This All About?

SanitizHAR is a handy little Chrome DevTools extension. Its mission? To help you sanitize sensitive information from your HAR files so you can share them without accidentally revealing too much.

![](https://github.com/shayonj/sanitizhar/blob/main/internal/preview.jpg?raw=true)

## 💡 How to Use

1. **Install & Open**: Add SanitizHAR to your Chrome browser and open up the DevTools.
2. **Navigate**: Head over to the SanitizHAR tab.
3. **Select & Sanitize**: Check the boxes next to the headers, cookies, and query parameters you'd like to sanitize.
4. **Download**: Click the download button, and voilà! Your sanitized HAR file is ready.

## 🤔 Why Use SanitizHAR?

Because privacy matters! Whether it's a session cookie, an auth token, or just some quirky headers your backend team uses, some things are meant to be kept secret. SanitizHAR ensures you can share HAR files without oversharing.

## 🌟 Contribute

Think you can make SanitizHAR even more awesome? Pull requests are welcome! Dive into the code, tweak, improve, and send it our way.

## Publishing

- `yarn && yarn build`
- Upload `dist/sanitizhar.zip` through Chrome Web Store
