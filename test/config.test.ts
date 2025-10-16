import { describe, it, expect, vi, beforeEach } from 'vitest'
import Browser from 'webextension-polyfill'
import {
  getUserConfig,
  updateUserConfig,
  getProviderConfigs,
  saveProviderConfigs,
  ProviderType,
  ChatGPTMode,
} from '../src/config'

// The webextension-polyfill is already mocked in test/setup.ts

describe('Config Management', () => {
  beforeEach(() => {
    // Clear mock history before each test
    vi.clearAllMocks()
  })

  describe('UserConfig', () => {
    it('should get user config with default values', async () => {
      vi.mocked(Browser.storage.local.get).mockResolvedValue({})
      const config = await getUserConfig()
      expect(Browser.storage.local.get).toHaveBeenCalledOnce()
      expect(config.theme).toBe('auto')
      expect(config.triggerMode).toBe('always')
    })

    it('should update user config', async () => {
      const updates = { theme: 'dark' as const }
      await updateUserConfig(updates)
      expect(Browser.storage.local.set).toHaveBeenCalledWith(updates)
    })
  })

  describe('ProviderConfigs', () => {
    it('should get provider configs and decode API keys', async () => {
      const storedConfigs = {
        'provider-configs': {
          provider: ProviderType.Gemini,
          configs: {
            chatgpt: { mode: ChatGPTMode.API, apiKey: btoa('test-openai-key') },
            gemini: { apiKey: btoa('test-gemini-key') },
          },
        },
      }
      vi.mocked(Browser.storage.local.get).mockResolvedValue(storedConfigs)

      const config = await getProviderConfigs()

      expect(Browser.storage.local.get).toHaveBeenCalledWith('provider-configs')
      expect(config.provider).toBe(ProviderType.Gemini)
      expect(config.configs.chatgpt.apiKey).toBe('test-openai-key')
      expect(config.configs.gemini.apiKey).toBe('test-gemini-key')
    })

    it('should save provider configs and encode API keys', async () => {
      const newConfigs = {
        provider: ProviderType.ChatGPT,
        configs: {
          chatgpt: {
            mode: ChatGPTMode.API,
            apiKey: 'plain-openai-key',
          },
          gemini: {
            apiKey: 'plain-gemini-key',
          },
        },
      }

      await saveProviderConfigs(newConfigs)

      expect(Browser.storage.local.set).toHaveBeenCalledOnce()
      const savedData = vi.mocked(Browser.storage.local.set).mock.calls[0][0]

      const expectedSavedData = {
        'provider-configs': {
          ...newConfigs,
          configs: {
            chatgpt: {
              ...newConfigs.configs.chatgpt,
              apiKey: btoa('plain-openai-key'),
            },
            gemini: {
              ...newConfigs.configs.gemini,
              apiKey: btoa('plain-gemini-key'),
            },
          },
        },
      }

      expect(savedData).toEqual(expectedSavedData)
    })
  })
})
