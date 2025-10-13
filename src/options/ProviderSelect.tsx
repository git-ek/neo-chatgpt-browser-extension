import { Button, Input, Select, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

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
          setToast({ text: 'Please enter your OpenAI API key', type: 'error' })
          return
        }
        if (!model || !models.includes(model)) {
          setToast({ text: 'Please select a valid model', type: 'error' })
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
          setToast({ text: 'Please enter your Gemini API key', type: 'error' })
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
      setToast({ text: 'Changes saved', type: 'success' })
    } catch (err) {
      setToast({
        text: 'Failed to save: ' + (err instanceof Error ? err.message : String(err)),
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
        text: 'Failed to load model list: ' + (err instanceof Error ? err.message : String(err)),
        type: 'error',
      })
      setDynamicModels([])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={handleTabChange}>
        <Tabs.Item label="ChatGPT webapp" value={ProviderType.ChatGPT}>
          The API that powers ChatGPT webapp, free, but sometimes unstable
        </Tabs.Item>
        <Tabs.Item label="OpenAI API" value={ProviderType.GPT3}>
          <div className="flex flex-col gap-2">
            <span>The official OpenAI API. More stable and supports custom models.</span>{' '}
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={model}
                onChange={(v) => setModel(v as string)}
                placeholder="model"
              >
                {dynamicModels.map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...apiKeyBindings} />
            </div>
            <div className="text-xs text-red-500 mt-1">
              ⚠️ Your API key is stored in your browser&apos;s extension storage after being
              obfuscated (Base64 encoded).
              <br />
              For your security: do not share your browser profile, remove unused keys, and prefer
              limited-scope keys.
              <br />
              See{' '}
              <a
                href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>{' '}
              for details.
            </div>
            <span className="italic text-xs">
              You can find or create your API key
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </span>
          </div>
        </Tabs.Item>
        <Tabs.Item label="Gemini API" value={ProviderType.Gemini}>
          <div className="flex flex-col gap-2">
            <span>The official Google Gemini API. Fast, powerful, and multimodal.</span>{' '}
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={geminiModel}
                onChange={(v) => setGeminiModel(v as string)}
                placeholder="model"
              >
                {dynamicModels.map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...geminiKeyBindings} />
            </div>
            <div className="text-xs text-red-500 mt-1">
              ⚠️ Your API key is stored in your browser&apos;s extension storage after being
              obfuscated (Base64 encoded).
              <br />
              For your security: do not share your browser profile, remove unused keys, and prefer
              limited-scope keys.
              <br />
              See{' '}
              <a
                href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>{' '}
              for details.
            </div>
            <span className="italic text-xs">
              You can get your Gemini API key
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                here
              </a>
            </span>
          </div>
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost style={{ width: 20 }} type="success" onClick={save}>
        Save
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
      <div className="text-red-500">Failed to load provider configs: {String(query.error)}</div>
    )
  }
  return <ConfigPanel config={query.data!.config} models={query.data!.models} />
}

export default ProviderSelect
