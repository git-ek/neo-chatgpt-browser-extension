import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './providers/chatgpt'
import { OpenAIProvider } from './providers/openai'
import { GeminiProvider } from './providers/gemini'
import { Provider } from './types'

async function generateAnswers(port: Browser.Runtime.Port, question: string) {
  const providerConfigs = await getProviderConfigs()

  let provider: Provider
  if (providerConfigs.provider === ProviderType.ChatGPT) {
    const token = await getChatGPTAccessToken()
    provider = new ChatGPTProvider(token)
  } else if (providerConfigs.provider === ProviderType.GPT3) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]!
    provider = new OpenAIProvider(apiKey, model)
  } else if (providerConfigs.provider === ProviderType.Gemini) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.Gemini]!
    provider = new GeminiProvider(apiKey, model)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

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
  port.onMessage.addListener(async (msg: { question: string }) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('received msg', msg)
    }
    try {
      await generateAnswers(port, msg.question)
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(err)
      }
      port.postMessage({ error: err.message })
    }
  })
})


Browser.runtime.onMessage.addListener(async (message: { type: string; data?: any }) => {
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
