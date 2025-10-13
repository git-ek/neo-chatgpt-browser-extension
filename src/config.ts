import { defaults, forEach } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  QuestionMark = 'questionMark',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: 'Always', desc: 'ChatGPT is queried on every search' },
  [TriggerMode.QuestionMark]: {
    title: 'Question Mark',
    desc: 'When your query ends with a question mark (?) ',
  },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ChatGPT is queried when you manually click a button',
  },
}

export enum Theme {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
  Gemini = 'gemini',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

interface GeminiProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT3]?: GPT3ProviderConfig
    [ProviderType.Gemini]?: GeminiProviderConfig
  }
}

const providerConfigsWithDefaultValue: ProviderConfigs = {
  provider: ProviderType.ChatGPT,
  configs: {},
}

const STORAGE_KEY_PROVIDER_CONFIGS = 'provider-configs'

// Simple obfuscation for API keys
const encode = (str: string) => btoa(str)
const decode = (str: string) => atob(str)

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const result = await Browser.storage.local.get(STORAGE_KEY_PROVIDER_CONFIGS)
  const storedConfigs = result[STORAGE_KEY_PROVIDER_CONFIGS]

  if (storedConfigs) {
    // Decode API keys
    forEach(storedConfigs.configs, (config) => {
      if (config?.apiKey) {
        config.apiKey = decode(config.apiKey)
      }
    })
  }

  return defaults(storedConfigs, providerConfigsWithDefaultValue)
}

export async function saveProviderConfigs(configs: ProviderConfigs) {
  const newConfigs = { ...configs }

  // Encode API keys
  forEach(newConfigs.configs, (config) => {
    if (config?.apiKey) {
      config.apiKey = encode(config.apiKey)
    }
  })

  return Browser.storage.local.set({ [STORAGE_KEY_PROVIDER_CONFIGS]: newConfigs })
}
