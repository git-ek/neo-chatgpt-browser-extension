import { Input, Select } from '@geist-ui/core'
import { ChangeEvent } from 'react'
import Browser from 'webextension-polyfill'

interface InputBindings {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

interface Props {
  apiKeyBindings: InputBindings
  model: string
  setModel: (model: string) => void
  dynamicModels: string[]
}

export default function OpenAIConfig({ apiKeyBindings, model, setModel, dynamicModels }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span>{Browser.i18n.getMessage('ext_provider_openai_api_desc')}</span>{' '}
      <div className="flex flex-row gap-2">
        <Select
          scale={2 / 3}
          value={model}
          onChange={(v) => setModel(v as string)}
          placeholder={Browser.i18n.getMessage('ext_model_placeholder')}
        >
          {dynamicModels.map((m) => (
            <Select.Option key={m} value={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
        <Input
          htmlType="password"
          label={Browser.i18n.getMessage('ext_api_key_label')}
          scale={2 / 3}
          {...apiKeyBindings}
        />
      </div>
      <div className="text-xs text-red-500 mt-1">
        {Browser.i18n.getMessage('ext_api_key_warning1')}
        <br />
        {Browser.i18n.getMessage('ext_api_key_warning2')}
        <br />
        {Browser.i18n.getMessage('ext_see_prefix')}{' '}
        <a
          href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
          target="_blank"
          rel="noreferrer"
        >
          {Browser.i18n.getMessage('ext_privacy_link_text')}
        </a>{' '}
        {Browser.i18n.getMessage('ext_for_details_suffix')}
      </div>
      <span className="italic text-xs">
        {Browser.i18n.getMessage('ext_openai_api_key_guide')}
        <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">
          {Browser.i18n.getMessage('ext_link_here')}
        </a>
      </span>
    </div>
  )
}
