import { FC, useCallback, useState, useEffect } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import {
  getProviderConfigs,
  ProviderConfigs,
  ProviderType,
  saveProviderConfigs,
  ChatGPTMode,
} from '../config'
import GeminiConfig from './GeminiConfig'
import OpenAIConfig from './OpenAIConfig'

// A simple, dependency-free toast implementation
const Toast: FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({
  message,
  type,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-md text-white ${bgColor} shadow-lg transition-opacity duration-300`}
    >
      {message}
    </div>
  )
}

async function loadModels(provider?: ProviderType): Promise<string[]> {
  if (provider === ProviderType.Gemini) {
    return ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro']
  }
  // Return a default list for OpenAI or when no provider is specified
  return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
}

const ConfigPanel: FC<{ initialConfigs: ProviderConfigs; models: string[] }> = ({
  initialConfigs,
  models,
}) => {
  const [provider, setProvider] = useState<ProviderType>(initialConfigs.provider)

  // State for API keys and models
  const [chatGPTMode, setChatGPTMode] = useState<ChatGPTMode>(initialConfigs.configs.chatgpt.mode)
  const [chatGPTApiKey, setChatGPTApiKey] = useState(initialConfigs.configs.chatgpt.apiKey ?? '')
  const [chatGPTModel, setChatGPTModel] = useState(
    initialConfigs.configs.chatgpt.model ?? models[0],
  )
  const [geminiApiKey, setGeminiApiKey] = useState(initialConfigs.configs.gemini.apiKey ?? '')
  const [geminiModel, setGeminiModel] = useState(
    initialConfigs.configs.gemini.model ?? 'gemini-1.5-pro-latest',
  )

  const [dynamicModels, setDynamicModels] = useState<string[]>(models)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleTabChange = async (newProvider: ProviderType) => {
    setProvider(newProvider)
    try {
      const loaded = await loadModels(newProvider)
      setDynamicModels(loaded)
      if (newProvider === ProviderType.ChatGPT) {
        setChatGPTModel(loaded[0])
      } else {
        setGeminiModel(loaded[0])
      }
    } catch (err) {
      setToast({ message: `Failed to load models: ${err.message}`, type: 'error' })
    }
  }

  const save = useCallback(async () => {
    if (provider === ProviderType.ChatGPT && chatGPTMode === ChatGPTMode.API && !chatGPTApiKey) {
      setToast({ message: Browser.i18n.getMessage('ext_toast_enter_openai_key'), type: 'error' })
      return
    }
    if (provider === ProviderType.Gemini && !geminiApiKey) {
      setToast({ message: Browser.i18n.getMessage('ext_toast_enter_gemini_key'), type: 'error' })
      return
    }

    const newConfigs: ProviderConfigs = {
      provider,
      configs: {
        chatgpt: {
          mode: chatGPTMode,
          apiKey: chatGPTApiKey,
          model: chatGPTModel,
        },
        gemini: {
          apiKey: geminiApiKey,
          model: geminiModel,
        },
      },
    }

    try {
      await saveProviderConfigs(newConfigs)
      setToast({ message: Browser.i18n.getMessage('ext_toast_changes_saved'), type: 'success' })
    } catch (err) {
      setToast({
        message: `${Browser.i18n.getMessage('ext_toast_failed_to_save')} ${err.message}`,
        type: 'error',
      })
    }
  }, [provider, chatGPTMode, chatGPTApiKey, chatGPTModel, geminiApiKey, geminiModel])

  const tabClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-200 hover:bg-gray-300'
    }`

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
        <div className="flex space-x-2">
          <button
            className={tabClass(provider === ProviderType.ChatGPT)}
            onClick={() => handleTabChange(ProviderType.ChatGPT)}
          >
            ChatGPT
          </button>
          <button
            className={tabClass(provider === ProviderType.Gemini)}
            onClick={() => handleTabChange(ProviderType.Gemini)}
          >
            Gemini
          </button>
        </div>
        <button
          onClick={save}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {Browser.i18n.getMessage('ext_save_button')}
        </button>
      </div>

      {provider === ProviderType.ChatGPT && (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="chatgpt-mode"
                value={ChatGPTMode.Webapp}
                checked={chatGPTMode === ChatGPTMode.Webapp}
                onChange={(e) => setChatGPTMode(e.target.value as ChatGPTMode)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>{Browser.i18n.getMessage('ext_chatgpt_mode_webapp')}</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="chatgpt-mode"
                value={ChatGPTMode.API}
                checked={chatGPTMode === ChatGPTMode.API}
                onChange={(e) => setChatGPTMode(e.target.value as ChatGPTMode)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>{Browser.i18n.getMessage('ext_chatgpt_mode_api')}</span>
            </label>
          </div>
          {chatGPTMode === ChatGPTMode.API && (
            <OpenAIConfig
              apiKeyBindings={{
                value: chatGPTApiKey,
                onChange: (e) => setChatGPTApiKey(e.target.value),
              }}
              model={chatGPTModel}
              setModel={setChatGPTModel}
              dynamicModels={dynamicModels}
            />
          )}
        </div>
      )}

      {provider === ProviderType.Gemini && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <GeminiConfig
            apiKeyBindings={{
              value: geminiApiKey,
              onChange: (e) => setGeminiApiKey(e.target.value),
            }}
            model={geminiModel}
            setModel={setGeminiModel}
            dynamicModels={dynamicModels}
          />
        </div>
      )}
    </div>
  )
}

function ProviderSelect() {
  const { data, error } = useSWR('provider-configs', async () => {
    const [config, models] = await Promise.all([
      getProviderConfigs(),
      loadModels(new URLSearchParams(window.location.search).get('provider') as ProviderType),
    ])
    return { config, models }
  })

  if (error) {
    return (
      <div className="text-red-500">{`${Browser.i18n.getMessage(
        'ext_toast_failed_to_load_configs',
      )} ${error.message}`}</div>
    )
  }
  if (!data) {
    return <div role="status">Loading...</div>
  }

  return <ConfigPanel initialConfigs={data.config} models={data.models} />
}

export default ProviderSelect
