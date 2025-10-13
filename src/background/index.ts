import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { sendMessageFeedback, getChatGPTAccessToken } from './providers/chatgpt'
import { ProviderFactory } from './providers/factory'

async function generateAnswers(
  port: Browser.Runtime.Port,
  question: string,
  providerType?: ProviderType,
) {
  const providerConfigs = await getProviderConfigs()

  const provider = await ProviderFactory.create(providerConfigs, providerType)

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
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
