import { FC, useCallback, useState } from 'react'
import Browser from 'webextension-polyfill'
import {
  ProviderConfigs,
  ProviderType,
  saveProviderConfigs,
  ChatGPTMode,
  UserConfig,
  updateUserConfig,
  Language,
} from '../../config'
import GeminiConfig from '../GeminiConfig'
import OpenAIConfig from '../OpenAIConfig'
import { Toast } from './Toast'

type ActiveSettingsTab = ProviderType | 'default'

const DefaultSettings: FC<{
  defaultProvider: ProviderType
  setDefaultProvider: (provider: ProviderType) => void
  language: Language
  setLanguage: (language: Language) => void
}> = ({ defaultProvider, setDefaultProvider, language, setLanguage }) => (
  <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-200">
        {Browser.i18n.getMessage('ext_default_model_label')}
      </h3>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="default-provider"
            value={ProviderType.ChatGPT}
            checked={defaultProvider === ProviderType.ChatGPT}
            onChange={(e) => setDefaultProvider(e.target.value as ProviderType)}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="dark:text-gray-300">ChatGPT</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="default-provider"
            value={ProviderType.Gemini}
            checked={defaultProvider === ProviderType.Gemini}
            onChange={(e) => setDefaultProvider(e.target.value as ProviderType)}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="dark:text-gray-300">Gemini</span>
        </label>
      </div>
    </div>
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-200">
        {Browser.i18n.getMessage('ext_language_label')}
      </h3>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {Object.entries(Language).map(([key, value]) => (
          <option key={value} value={value}>
            {key}
          </option>
        ))}
      </select>
    </div>
  </div>
)

export const ConfigPanel: FC<{
  initialConfigs: ProviderConfigs
  initialUserConfig: UserConfig
  models: string[]
}> = ({ initialConfigs, initialUserConfig, models }) => {
  const [activeTab, setActiveTab] = useState<ActiveSettingsTab>('default')
  const [defaultProvider, setDefaultProvider] = useState<ProviderType>(initialConfigs.provider) // For the radio buttons
  const [language, setLanguage] = useState<Language>(initialUserConfig.language)

  // State for API keys and models
  const [chatGPTMode, setChatGPTMode] = useState<ChatGPTMode>(initialConfigs.configs.chatgpt.mode)
  const [chatGPTApiKey, setChatGPTApiKey] = useState(initialConfigs.configs.chatgpt.apiKey ?? '')
  const [chatGPTModel, setChatGPTModel] = useState(
    initialConfigs.configs.chatgpt.model ?? models[0],
  )
  const [geminiApiKey, setGeminiApiKey] = useState(initialConfigs.configs.gemini.apiKey ?? '')
  const [geminiModel, setGeminiModel] = useState(initialConfigs.configs.gemini.model ?? models[0])

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const save = useCallback(async () => {
    if (
      defaultProvider === ProviderType.ChatGPT &&
      chatGPTMode === ChatGPTMode.API &&
      !chatGPTApiKey
    ) {
      setToast({ message: Browser.i18n.getMessage('ext_toast_enter_openai_key'), type: 'error' })
      return
    }
    if (defaultProvider === ProviderType.Gemini && !geminiApiKey) {
      setToast({ message: Browser.i18n.getMessage('ext_toast_enter_gemini_key'), type: 'error' })
      return
    }

    const newConfigs: ProviderConfigs = {
      provider: defaultProvider,
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
      await updateUserConfig({ language })
      setToast({ message: Browser.i18n.getMessage('ext_toast_changes_saved'), type: 'success' })
    } catch (err) {
      setToast({
        message: `${Browser.i18n.getMessage('ext_toast_failed_to_save')} ${err.message}`,
        type: 'error',
      })
    }
  }, [
    defaultProvider,
    chatGPTMode,
    chatGPTApiKey,
    chatGPTModel,
    geminiApiKey,
    geminiModel,
    language,
  ])

  const tabClass = (isActive: boolean) =>
    `px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-colors ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
        : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
    }`

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      <div className="flex items-center justify-between rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
        <div className="flex flex-1 space-x-1">
          <button
            className={tabClass(activeTab === 'default')}
            onClick={() => setActiveTab('default')}
          >
            {Browser.i18n.getMessage('ext_default_provider_label')}
          </button>
          <button
            className={tabClass(activeTab === ProviderType.ChatGPT)}
            onClick={() => setActiveTab(ProviderType.ChatGPT)}
          >
            ChatGPT
          </button>
          <button
            className={tabClass(activeTab === ProviderType.Gemini)}
            onClick={() => setActiveTab(ProviderType.Gemini)}
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

      {activeTab === 'default' && (
        <DefaultSettings
          defaultProvider={defaultProvider}
          setDefaultProvider={setDefaultProvider}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {activeTab === ProviderType.ChatGPT && (
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
              dynamicModels={models}
            />
          )}
        </div>
      )}

      {activeTab === ProviderType.Gemini && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <GeminiConfig
            apiKeyBindings={{
              value: geminiApiKey,
              onChange: (e) => setGeminiApiKey(e.target.value),
            }}
            model={geminiModel}
            setModel={setGeminiModel}
            dynamicModels={models}
          />
        </div>
      )}
    </div>
  )
}
