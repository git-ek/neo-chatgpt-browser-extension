import { ChangeEvent } from 'react'
import Browser from 'webextension-polyfill'

interface InputBindings {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

interface Props {
  apiKeyBindings: InputBindings
  model: string
  setModel: (model: string) => void
  dynamicModels: string[]
}

export default function GeminiConfig({ apiKeyBindings, model, setModel, dynamicModels }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">{Browser.i18n.getMessage('ext_provider_gemini_api_desc')}</p>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="gemini-model" className="block text-sm font-medium text-gray-700">
            {Browser.i18n.getMessage('ext_model_placeholder')}
          </label>
          <select
            id="gemini-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {dynamicModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700">
            {Browser.i18n.getMessage('ext_api_key_label')}
          </label>
          <input
            id="gemini-api-key"
            type="password"
            {...apiKeyBindings}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="text-xs text-red-500 mt-1">
        <p>{Browser.i18n.getMessage('ext_api_key_warning1')}</p>
        <p>{Browser.i18n.getMessage('ext_api_key_warning2')}</p>
        <p>
          {Browser.i18n.getMessage('ext_see_prefix')}{' '}
          <a
            href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {Browser.i18n.getMessage('ext_privacy_link_text')}
          </a>{' '}
          {Browser.i18n.getMessage('ext_for_details_suffix')}
        </p>
      </div>
      <p className="italic text-xs">
        {Browser.i18n.getMessage('ext_gemini_api_key_guide')}{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {Browser.i18n.getMessage('ext_link_here')}
        </a>
        .
      </p>
    </div>
  )
}
