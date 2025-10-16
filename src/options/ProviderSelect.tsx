import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { ConfigPanel } from '../../ConfigPanel'

async function loadModels(provider?: ProviderType): Promise<string[]> {
  if (provider === ProviderType.Gemini) {
    return ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro']
  }
  // Return a default list for OpenAI or when no provider is specified
  return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
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
