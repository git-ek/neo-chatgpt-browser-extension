import { describe, it, expect, vi } from 'vitest'
import { ProviderFactory } from '../../../src/background/providers/factory'
import { ChatGPTMode, ProviderConfigs, ProviderType } from '../../../src/config'
import { OpenAIProvider } from '../../../src/background/providers/openai'
import { GeminiProvider } from '../../../src/background/providers/gemini'
import { ChatGPTProvider } from '../../../src/background/providers/chatgpt'

// Mock dependencies
vi.mock('../../../src/background/providers/openai')
vi.mock('../../../src/background/providers/gemini')
vi.mock('../../../src/background/providers/chatgpt', () => ({
  getChatGPTAccessToken: vi.fn().mockResolvedValue('test-access-token'),
  ChatGPTProvider: vi.fn(),
}))

describe('ProviderFactory', () => {
  const baseConfigs: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: {
        mode: ChatGPTMode.API,
        apiKey: 'test-openai-key',
        model: 'gpt-4',
      },
      gemini: {
        apiKey: 'test-gemini-key',
        model: 'gemini-pro',
      },
    },
  }

  it('should create an OpenAIProvider for ChatGPT API mode', async () => {
    const provider = await ProviderFactory.create(baseConfigs)
    expect(OpenAIProvider).toHaveBeenCalledWith('test-openai-key', 'gpt-4')
    expect(provider).toBeInstanceOf(OpenAIProvider)
  })

  it('should create a GeminiProvider', async () => {
    const configs = { ...baseConfigs, provider: ProviderType.Gemini }
    const provider = await ProviderFactory.create(configs)
    expect(GeminiProvider).toHaveBeenCalledWith('test-gemini-key', 'gemini-pro')
    expect(provider).toBeInstanceOf(GeminiProvider)
  })

  it('should create a ChatGPTProvider for ChatGPT Webapp mode', async () => {
    const configs = {
      ...baseConfigs,
      configs: {
        ...baseConfigs.configs,
        chatgpt: { ...baseConfigs.configs.chatgpt, mode: ChatGPTMode.Webapp },
      },
    }
    const provider = await ProviderFactory.create(configs)
    expect(ChatGPTProvider).toHaveBeenCalledWith('test-access-token')
    expect(provider).toBeInstanceOf(ChatGPTProvider)
  })

  it('should throw an error for missing OpenAI API key', async () => {
    const configs = {
      ...baseConfigs,
      configs: {
        ...baseConfigs.configs,
        chatgpt: { ...baseConfigs.configs.chatgpt, apiKey: '' },
      },
    }
    await expect(ProviderFactory.create(configs)).rejects.toThrow(
      'API key or model not set for OpenAI API',
    )
  })

  it('should throw an error for missing Gemini API key', async () => {
    const configs = {
      ...baseConfigs,
      provider: ProviderType.Gemini,
      configs: {
        ...baseConfigs.configs,
        gemini: { ...baseConfigs.configs.gemini, apiKey: '' },
      },
    }
    await expect(ProviderFactory.create(configs)).rejects.toThrow(
      'API key or model not set for Gemini API',
    )
  })

  it('should throw an error for unknown provider', async () => {
    const configs = { ...baseConfigs, provider: 'unknown' as ProviderType }
    await expect(ProviderFactory.create(configs)).rejects.toThrow('Unknown provider: unknown')
  })
})
