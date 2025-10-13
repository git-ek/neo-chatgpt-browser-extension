import { ChatGPTMode, ProviderConfigs, ProviderType } from '../../config'
import { Provider } from '../types'
import { ChatGPTProvider, getChatGPTAccessToken } from './chatgpt'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'

export class ProviderFactory {
  static async create(configs: ProviderConfigs, overrideType?: ProviderType): Promise<Provider> {
    const providerType = overrideType ?? configs.provider

    switch (providerType) {
      case ProviderType.ChatGPT: {
        const chatGPTConfig = configs.configs.chatgpt
        if (chatGPTConfig.mode === ChatGPTMode.API) {
          if (!chatGPTConfig.apiKey || !chatGPTConfig.model) {
            throw new Error('API key or model not set for OpenAI API')
          }
          return new OpenAIProvider(chatGPTConfig.apiKey, chatGPTConfig.model)
        } else {
          const token = await getChatGPTAccessToken()
          return new ChatGPTProvider(token)
        }
      }

      case ProviderType.Gemini: {
        const geminiConfig = configs.configs.gemini
        if (!geminiConfig.apiKey || !geminiConfig.model) {
          throw new Error('API key or model not set for Gemini API')
        }
        return new GeminiProvider(geminiConfig.apiKey, geminiConfig.model)
      }

      default:
        throw new Error(`Unknown provider: ${providerType}`)
    }
  }
}
