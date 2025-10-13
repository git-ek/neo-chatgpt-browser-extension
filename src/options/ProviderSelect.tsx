import { Button, Radio, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
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

// ... (loadModels function remains the same)
async function loadModels(provider?: ProviderType): Promise<string[]> {
  if (provider === ProviderType.Gemini) {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-pro',
    ]
  }
  return [
    'gpt-5',
    'gpt-5-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4',
    'gpt-4-32k',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ]
}

const ConfigPanel: FC<{ initialConfigs: ProviderConfigs; models: string[] }> = ({
  initialConfigs,
  models,
}) => {
  const [provider, setProvider] = useState<ProviderType>(initialConfigs.provider)

  // ChatGPT state
  const [chatGPTMode, setChatGPTMode] = useState<ChatGPTMode>(initialConfigs.configs.chatgpt.mode)
  const { bindings: chatGPTApiKeyBindings } = useInput(initialConfigs.configs.chatgpt.apiKey ?? '')
  const [chatGPTModel, setChatGPTModel] = useState(
    initialConfigs.configs.chatgpt.model ?? models[0],
  )

  // Gemini state
  const { bindings: geminiApiKeyBindings } = useInput(initialConfigs.configs.gemini.apiKey ?? '')
  const [geminiModel, setGeminiModel] = useState(
    initialConfigs.configs.gemini.model ?? 'gemini-1.5-pro-latest',
  )

  const [dynamicModels, setDynamicModels] = useState<string[]>(models)
  const { setToast } = useToasts()

  const handleTabChange = async (val: string) => {
    const newProvider = val as ProviderType
    setProvider(newProvider)
    try {
      const loaded = await loadModels(newProvider)
      setDynamicModels(loaded)
    } catch (err) {
      setToast({ text: `Failed to load models: ${err.message}`, type: 'error' })
    }
  }

  const save = useCallback(async () => {
    const newConfigs: ProviderConfigs = {
      provider,
      configs: {
        chatgpt: {
          mode: chatGPTMode,
          apiKey: chatGPTApiKeyBindings.value,
          model: chatGPTModel,
        },
        gemini: {
          apiKey: geminiApiKeyBindings.value,
          model: geminiModel,
        },
      },
    }

    if (
      provider === ProviderType.ChatGPT &&
      chatGPTMode === ChatGPTMode.API &&
      !chatGPTApiKeyBindings.value
    ) {
      setToast({ text: Browser.i18n.getMessage('ext_toast_enter_openai_key'), type: 'error' })
      return
    }
    if (provider === ProviderType.Gemini && !geminiApiKeyBindings.value) {
      setToast({ text: Browser.i18n.getMessage('ext_toast_enter_gemini_key'), type: 'error' })
      return
    }

    try {
      await saveProviderConfigs(newConfigs)
      setToast({ text: Browser.i18n.getMessage('ext_toast_changes_saved'), type: 'success' })
    } catch (err) {
      setToast({
        text: `${Browser.i18n.getMessage('ext_toast_failed_to_save')} ${err.message}`,
        type: 'error',
      })
    }
  }, [
    provider,
    chatGPTMode,
    chatGPTApiKeyBindings,
    chatGPTModel,
    geminiApiKeyBindings,
    geminiModel,
    setToast,
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Tabs value={provider} onChange={handleTabChange}>
          <Tabs.Item label="ChatGPT" value={ProviderType.ChatGPT} />
          <Tabs.Item label="Gemini ⚙️" value={ProviderType.Gemini} />
        </Tabs>
        <Button auto type="success" onClick={save}>
          {Browser.i18n.getMessage('ext_save_button')}
        </Button>
      </div>

      {provider === ProviderType.ChatGPT && (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
          <Radio.Group value={chatGPTMode} onChange={(v) => setChatGPTMode(v as ChatGPTMode)}>
            <Radio value={ChatGPTMode.Webapp}>Webapp</Radio>
            <Radio value={ChatGPTMode.API}>API</Radio>
          </Radio.Group>
          {chatGPTMode === ChatGPTMode.API && (
            <OpenAIConfig
              apiKeyBindings={chatGPTApiKeyBindings}
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
            apiKeyBindings={geminiApiKeyBindings}
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
    const [config, models] = await Promise.all([getProviderConfigs(), loadModels()])
    return { config, models }
  })

  if (error) {
    return (
      <div className="text-red-500">{`${Browser.i18n.getMessage('ext_toast_failed_to_load_configs')} ${error.message}`}</div>
    )
  }
  if (!data) {
    return <Spinner />
  }

  return <ConfigPanel initialConfigs={data.config} models={data.models} />
}

export default ProviderSelect
