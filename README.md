
# Neo ChatGPT for Browser Extension

Neo ChatGPT for Browser Extension is an open-source browser extension that displays ChatGPT responses alongside search results on various search engines (Google, Bing, Naver, etc.).

## Features

- Supports Google, Bing, Naver, and other major search engines
- Supports both OpenAI official API and ChatGPT webapp API
- Dark/Light theme, language selection, trigger modes (always/question/manual)
- Markdown rendering, code highlighting, copy, feedback features
- Fast setup and user-friendly UI


## Build & Install

### 1. Clone the repository
```bash
git clone https://github.com/git-ek/neo-chatgpt-browser-extension.git
```

### 2. Install dependencies
```bash
npm install
```


### 3. Build the extension
```bash
npm run build
```
After build completes, you will find `build/chromium/` and `build/firefox/` folders.

### 4. Clean build artifacts
To remove build artifacts, delete the `build/` directory manually or use the following command:
```bash
rm -rf build/
```

### 5. Install on Chrome browser
1. Go to `chrome://extensions` in your Chrome browser.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the `build/chromium/` folder.
5. The extension will be installed and ready to use.

### 6. Install on Firefox browser
1. Go to `about:debugging#/runtime/this-firefox` in your Firefox browser.
2. Click "Load Temporary Add-on".
3. Select the `build/firefox/manifest.json` file.
4. The extension will be loaded temporarily.

## Screenshot

![Screenshot](screenshots/extension.png?raw=true)

## FAQ & Troubleshooting

- **Brave**: Disable "Prevent sites from fingerprinting me based on my language preferences" in `brave://settings/shields`.
- **Opera**: Enable "Allow access to search page results" in the extension management page.

## Credits & License

This project is based on [wong2/chatgpt-google-extension](https://github.com/wong2/chatgpt-google-extension) (Copyright © wong2).
Modified and maintained by git-ek (2025).
Distributed under the GNU GPL v3 license. See LICENSE for details.


## External Resources & Licenses

- [Geist UI](https://github.com/geist-org/react) - MIT License
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - MIT License
- [Autoprefixer](https://github.com/postcss/autoprefixer) - MIT License
- [esbuild](https://github.com/evanw/esbuild) - MIT License
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill) - MPL 2.0
- [React Markdown](https://github.com/remarkjs/react-markdown) - MIT License
- [rehype-highlight](https://github.com/rehypejs/rehype-highlight) - MIT License
- [Octicons](https://github.com/primer/octicons) - MIT License
- All images and icons in `src/_locales/` and `src/logo.png` are either original or GPL/MIT compatible.

Please refer to each library's documentation for details. Only GPL-compatible resources are used in this project.


## API Key Storage Policy

⚠️ **Warning:** Your API keys are stored in your browser's local extension storage in plain text. For your security:
- Do not share your browser profile or extension data with others.
- Remove your API keys if you no longer use the extension.
- Prefer using dedicated, limited-scope API keys if possible.
- We recommend periodically rotating your API keys.

Future versions may support encrypted storage, but currently, browser extension APIs do not guarantee full protection for sensitive keys.

## Privacy & Data Policy

This extension may process user data (e.g., API keys, search queries) for functional purposes only. No personal data is stored or shared externally. For details, refer to the Privacy Policy (to be provided if required by browser store).

## Trademark Notice

"ChatGPT" and "OpenAI" are trademarks of OpenAI. This project is not affiliated with or endorsed by OpenAI.
---
## Credits & License

This project is based on [wong2/chatgpt-google-extension](https://github.com/wong2/chatgpt-google-extension) (Copyright © wong2).
Modified and maintained by git-ek (2025).
Distributed under the GNU GPL v3 license. See LICENSE for details.

## External Resources & Libraries

- All external libraries, images, and icons used in this project are subject to their respective licenses. Please refer to each library's documentation for details. Only GPL-compatible resources are used.

## Privacy & Data Policy

- This extension may process user data (e.g., API keys, search queries) for functional purposes only. No personal data is stored or shared externally. For details, refer to the Privacy Policy (to be provided if required by browser store).

## Trademark Notice

- "ChatGPT" and "OpenAI" are trademarks of OpenAI. This project is not affiliated with or endorsed by OpenAI.

