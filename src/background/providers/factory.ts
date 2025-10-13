import { ProviderConfigs, ProviderType } from '../../config'
import { Provider } from '../types'
import { ChatGPTProvider, getChatGPTAccessToken } from './chatgpt'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'

export class ProviderFactory {
  static async create(configs: ProviderConfigs, overrideType?: ProviderType): Promise<Provider> {
    const providerType = overrideType ?? configs.provider

    switch (providerType) {
      case ProviderType.ChatGPT: {
        const token = await getChatGPTAccessToken()
        return new ChatGPTProvider(token)
      }

      case ProviderType.GPT3: {
        const { apiKey, model } = configs.configs[ProviderType.GPT3]!
        return new OpenAIProvider(apiKey, model)
      }

      case ProviderType.Gemini: {
        const { apiKey: geminiApiKey, model: geminiModel } = configs.configs[ProviderType.Gemini]!
        return new GeminiProvider(geminiApiKey, geminiModel)
      }

      default:
        throw new Error(`Unknown provider: ${providerType}`)
    }
  }
}
