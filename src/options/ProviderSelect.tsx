import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { ConfigPanel } from './components/ConfigPanel'
import { loadModels } from './utils'

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
