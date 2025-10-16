// This script runs in the offscreen document. It receives messages from the
// background script and makes fetch requests from within the chat.openai.com
// context, which helps to bypass Cloudflare protection.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROXY_FETCH') {
    // Differentiate between streaming and non-streaming requests
    if (request.isStreaming) {
      // For streaming, we need to handle the response body as a stream
      fetch(request.url, request.options)
        .then((response) => sendResponse({ success: true, body: response.body }))
        .catch((error) => sendResponse({ success: false, error: error.message }))
    } else {
      // For regular API calls, parse the response as JSON
      fetch(request.url, request.options)
        .then((response) => response.json())
        .then((data) => sendResponse({ success: true, data }))
        .catch((error) => sendResponse({ success: false, error: error.message }))
    }
    // Return true to indicate that the response is sent asynchronously
    return true
  }
})
