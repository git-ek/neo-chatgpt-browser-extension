# API Key Encryption Storage Research Report

## Background
API keys for the browser extension were previously stored in plain text. This report investigates methods for more secure storage to enhance security.

## Potential Methods

1.  **Using the Web Crypto API**
    - The built-in browser encryption API (`window.crypto.subtle`) can be used for AES or RSA encryption.
    - However, this approach presents significant key management challenges. It would require a separate user-provided input (like a password) or integration with OS authentication to securely manage the encryption key.

2.  **User-Input Based Encryption**
    - This method uses a password provided by the user as the key for encryption and decryption.
    - This complicates the user experience (UX) and makes key recovery impossible if the user forgets the password.

3.  **OS/Browser Auth Integration**
    - This involves using Native Messaging to connect with OS-level services like macOS Keychain or Windows DPAPI.
    - The setup is complex, and it suffers from low cross-browser compatibility, making it difficult to maintain.

## Conclusion and Recommendation
- While encryption with the Web Crypto API is technically possible, managing the decryption key in a truly secure way is not practical within the standard extension environment.
- Password-based encryption is not recommended due to its negative impact on UX and the lack of a recovery mechanism.
- OS/browser integration is not suitable for a production extension due to implementation complexity and compatibility issues.
- The most secure approach remains minimizing the storage of API keys, ideally by having the user input them on demand. However, this is often not practical for usability.

## Current Implementation
In the current version, instead of full encryption, a minimal measure of **Base64-based obfuscation** has been applied to avoid plain text storage. This is a temporary security enhancement. We may transition to a full encryption method if browser APIs provide a secure and standardized way to manage keys in the future.

## References
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Chrome Native Messaging](https://developer.chrome.com/docs/apps/nativeMessaging/)
- [Firefox Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)

---

For questions and suggestions, please <a href="https://github.com/git-ek/neo-chatgpt-browser-extension/issues">leave an issue on GitHub</a>.