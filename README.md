
# Neo ChatGPT for Browser Extension

Neo ChatGPT for Browser Extension is an open-source browser extension that displays ChatGPT responses alongside search results on various search engines (Google, Bing, Naver, etc.).

## Features

- Supports Google, Bing, Naver, and other major search engines
- Supports both OpenAI official API and ChatGPT webapp API
- Dark/Light theme, language selection, trigger modes (always/question/manual)
- Markdown rendering, code highlighting, copy, feedback features
- Fast setup and user-friendly UI

## Installation & Usage

1. Clone the repository:
	```bash
	git clone https://github.com/git-ek/neo-chatgpt-browser-extension.git
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Build the extension:
	```bash
	npm run build
	```
4. Load the `build/chromium/` or `build/firefox/` directory in your browser's extension management page.

## Screenshot

![Screenshot](screenshots/extension.png?raw=true)

## FAQ & Troubleshooting

- **Brave**: Disable "Prevent sites from fingerprinting me based on my language preferences" in `brave://settings/shields`.
- **Opera**: Enable "Allow access to search page results" in the extension management page.

## Credits & License

This project is based on [wong2/chatgpt-google-extension](https://github.com/wong2/chatgpt-google-extension) (Copyright © wong2).
Modified and maintained by git-ek (2025).
Distributed under the GNU GPL v3 license. See LICENSE for details.

## External Resources & Libraries

All external libraries, images, and icons used in this project are subject to their respective licenses. Only GPL-compatible resources are used.

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

