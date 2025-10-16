import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

// ... (userConfig related code remains the same)

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
  cardWidth: 800,
  cardHeight: 450,
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  return Browser.storage.local.set(updates)
}

// New Config Structure
export enum ProviderType {
  ChatGPT = 'chatgpt',
  Gemini = 'gemini',
}

export enum ChatGPTMode {
  Webapp = 'webapp',
  API = 'api',
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    chatgpt: {
      mode: ChatGPTMode
      apiKey?: string
      model?: string
    }
    gemini: {
      apiKey?: string
      model?: string
    }
  }
}

const providerConfigsWithDefaultValue: ProviderConfigs = {
  provider: ProviderType.ChatGPT,
  configs: {
    chatgpt: {
      mode: ChatGPTMode.Webapp,
    },
    gemini: {},
  },
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
    if (storedConfigs.configs.chatgpt.apiKey) {
      storedConfigs.configs.chatgpt.apiKey = decode(storedConfigs.configs.chatgpt.apiKey)
    }
    if (storedConfigs.configs.gemini.apiKey) {
      storedConfigs.configs.gemini.apiKey = decode(storedConfigs.configs.gemini.apiKey)
    }
  }

  return defaults(storedConfigs, providerConfigsWithDefaultValue)
}

export async function saveProviderConfigs(configs: ProviderConfigs) {
  const newConfigs = { ...configs }

  // Encode API keys
  if (newConfigs.configs.chatgpt.apiKey) {
    newConfigs.configs.chatgpt.apiKey = encode(newConfigs.configs.chatgpt.apiKey)
  }
  if (newConfigs.configs.gemini.apiKey) {
    newConfigs.configs.gemini.apiKey = encode(newConfigs.configs.gemini.apiKey)
  }

  return Browser.storage.local.set({ [STORAGE_KEY_PROVIDER_CONFIGS]: newConfigs })
}
