import { Button, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'
import GeminiConfig from './GeminiConfig'
import OpenAIConfig from './OpenAIConfig'

interface ConfigProps {
  config: ProviderConfigs
  models: string[]
}

async function loadModels(provider?: ProviderType): Promise<string[]> {
  // Server-independent: Return a hardcoded list of models.
  // This list can be updated manually in future versions.
  if (provider === ProviderType.Gemini) {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-pro',
    ]
  }
  // Default to OpenAI models
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

const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)
  // OpenAI
  const { bindings: apiKeyBindings } = useInput(config.configs[ProviderType.GPT3]?.apiKey ?? '')
  const [model, setModel] = useState(config.configs[ProviderType.GPT3]?.model ?? models[0])
  // Gemini
  const { bindings: geminiKeyBindings } = useInput(
    config.configs[ProviderType.Gemini]?.apiKey ?? '',
  )
  const [geminiModel, setGeminiModel] = useState(
    config.configs[ProviderType.Gemini]?.model ?? 'gemini-2.5-pro',
  )
  const { setToast } = useToasts()

  const save = useCallback(async () => {
    try {
      if (tab === ProviderType.GPT3) {
        if (!apiKeyBindings.value) {
          setToast({ text: Browser.i18n.getMessage('ext_toast_enter_openai_key'), type: 'error' })
          return
        }
        if (!model || !models.includes(model)) {
          setToast({ text: Browser.i18n.getMessage('ext_toast_select_valid_model'), type: 'error' })
          return
        }
        await saveProviderConfigs(tab, {
          [ProviderType.GPT3]: {
            model,
            apiKey: apiKeyBindings.value,
          },
          [ProviderType.Gemini]: config.configs[ProviderType.Gemini],
        })
      } else if (tab === ProviderType.Gemini) {
        if (!geminiKeyBindings.value) {
          setToast({ text: Browser.i18n.getMessage('ext_toast_enter_gemini_key'), type: 'error' })
          return
        }
        await saveProviderConfigs(tab, {
          [ProviderType.GPT3]: config.configs[ProviderType.GPT3],
          [ProviderType.Gemini]: {
            model: geminiModel,
            apiKey: geminiKeyBindings.value,
          },
        })
      }
      setToast({ text: Browser.i18n.getMessage('ext_toast_changes_saved'), type: 'success' })
    } catch (err) {
      setToast({
        text:
          Browser.i18n.getMessage('ext_toast_failed_to_save') +
          ' ' +
          (err instanceof Error ? err.message : String(err)),
        type: 'error',
      })
    }
  }, [
    apiKeyBindings.value,
    model,
    models,
    geminiKeyBindings.value,
    geminiModel,
    setToast,
    tab,
    config,
  ])

  // 모델 목록 동적 로딩 (탭 변경 시)
  const [dynamicModels, setDynamicModels] = useState<string[]>(models)
  const handleTabChange = async (val: string) => {
    const v = val as ProviderType
    setTab(v)
    try {
      const loaded = await loadModels(v)
      setDynamicModels(loaded)
    } catch (err) {
      setToast({
        text:
          Browser.i18n.getMessage('ext_toast_failed_to_load_models') +
          ' ' +
          (err instanceof Error ? err.message : String(err)),
        type: 'error',
      })
      setDynamicModels([])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={handleTabChange}>
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_chatgpt_webapp')}
          value={ProviderType.ChatGPT}
        >
          {Browser.i18n.getMessage('ext_provider_chatgpt_webapp_desc')}
        </Tabs.Item>
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_openai_api')}
          value={ProviderType.GPT3}
        >
          <OpenAIConfig
            apiKeyBindings={apiKeyBindings}
            model={model}
            setModel={setModel}
            dynamicModels={dynamicModels}
          />
        </Tabs.Item>
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_gemini_api')}
          value={ProviderType.Gemini}
        >
          <GeminiConfig
            apiKeyBindings={geminiKeyBindings}
            model={geminiModel}
            setModel={setGeminiModel}
            dynamicModels={dynamicModels}
          />
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost style={{ width: 20 }} type="success" onClick={save}>
        {Browser.i18n.getMessage('ext_save_button')}
      </Button>
    </div>
  )
}

function ProviderSelect() {
  const query = useSWR<{ config: ProviderConfigs; models: string[] }>(
    'provider-configs',
    async () => {
      const [config, models] = await Promise.all([getProviderConfigs(), loadModels()])
      return { config, models }
    },
  )
  if (query.isLoading) {
    return <Spinner />
  }
  if (query.error) {
    return (
      <div className="text-red-500">
        {Browser.i18n.getMessage('ext_toast_failed_to_load_configs')} {String(query.error)}
      </div>
    )
  }
  return <ConfigPanel config={query.data!.config} models={query.data!.models} />
}

export default ProviderSelect
