import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { getProviderConfigs } from '../config'
import { ConfigPanel } from './components/ConfigPanel'
import { loadModels } from './utils'

function ProviderSelect() {
  // Step 1: Fetch the saved provider configurations
  const { data: config, error: configError } = useSWR('provider-configs', getProviderConfigs)

  // Step 2: Fetch the models for the saved provider
  const { data: models, error: modelsError } = useSWR(
    () => (config ? ['models', config.provider] : null),
    ([, provider]) => loadModels(provider),
  )

  const error = configError || modelsError

  if (error) {
    return (
      <div className="text-red-500">{`${Browser.i18n.getMessage(
        'ext_toast_failed_to_load_configs',
      )} ${error.message}`}</div>
    )
  }
  if (!config || !models) {
    return <div role="status">{Browser.i18n.getMessage('ext_waiting_for_response')}</div>
  }

  return <ConfigPanel initialConfigs={config} models={models} />
}

export default ProviderSelect
