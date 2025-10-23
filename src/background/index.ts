import Browser from 'webextension-polyfill'
import { getProviderConfigs, getUserConfig, Language, ProviderType } from '../config'
import { sendMessageFeedback, getChatGPTAccessToken } from './providers/chatgpt'
import { ProviderFactory } from './providers/factory'

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html'

async function hasOffscreenDocument() {
  // @ts-expect-error: clients is not in the type definition
  const clients = await self.clients.matchAll()
  // @ts-expect-error: OffscreenDocument is not in the type definition
  return clients.some((client) => client.url.endsWith(OFFSCREEN_DOCUMENT_PATH))
}

async function setupOffscreenDocument() {
  // The offscreen API is not available in all browsers.
  if (!chrome.offscreen) {
    // This will be handled gracefully by the caller.
    return
  }
  if (await hasOffscreenDocument()) {
    return
  }
  // Use chrome.offscreen directly as the polyfill may not support it.
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['FETCH'],
    justification: 'To proxy fetch requests and bypass Cloudflare protection for Webapp mode.',
  })
}

async function generateAnswers(
  port: Browser.Runtime.Port,
  question: string,
  providerType?: ProviderType,
) {
  const providerConfigs = await getProviderConfigs()
  const userConfig = await getUserConfig()

  const providerToUse = providerType || providerConfigs.provider

  // For webapp mode, ensure the offscreen document is ready
  // This check should only run if the selected provider is ChatGPT AND its mode is webapp.
  if (providerToUse === ProviderType.ChatGPT && providerConfigs.configs.chatgpt.mode === 'webapp') {
    // The offscreen API is required for webapp mode to bypass Cloudflare.
    // If it's not available, we can't proceed with this mode.
    if (!chrome.offscreen) {
      throw new Error('The Webapp mode is not supported in your browser. Please use the API mode.')
    }
    await setupOffscreenDocument()
  }

  let prompt = question
  if (providerConfigs.promptPrefix) {
    prompt = `${providerConfigs.promptPrefix}\n\n${prompt}`
  }
  if (userConfig.language !== Language.Auto) {
    prompt = `${prompt} (Respond in ${userConfig.language})`
  }

  const provider = await ProviderFactory.create(providerConfigs, providerToUse)

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt,
    signal: controller.signal,
    onEvent(event) {
      // Check if the port is still connected before sending a message
      try {
        if (event.type === 'done') {
          port.postMessage({ event: 'DONE' })
          return
        }
        port.postMessage(event.data)
      } catch (e) {
        // This can happen if the port is disconnected, e.g., the user navigated away.
        // We can safely ignore this error.
        console.debug('Failed to post message to disconnected port:', e)
        controller.abort()
        cleanup?.()
      }
    },
  })
}

Browser.runtime.onConnect.addListener((port: Browser.Runtime.Port) => {
  port.onMessage.addListener(async (msg: { question: string; provider?: ProviderType }) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('received msg', msg)
    }
    try {
      await generateAnswers(port, msg.question, msg.provider)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(err)
      }
      port.postMessage({ error: err instanceof Error ? err.message : String(err) })
    }
  })
})

Browser.runtime.onMessage.addListener(async (message: { type: string; data?: unknown }) => {
  // Only set up the offscreen document if the API exists.
  if (chrome.offscreen) {
    await setupOffscreenDocument() // Ensure offscreen is available for feedback etc.
  }
  if (message.type === 'FEEDBACK') {
    const token = await getChatGPTAccessToken()
    await sendMessageFeedback(token, message.data)
  } else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    return getChatGPTAccessToken()
  }
})

Browser.runtime.onInstalled.addListener((details: { reason: string }) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
  }
})
