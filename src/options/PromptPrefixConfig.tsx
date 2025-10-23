import { FC } from 'react'
import Browser from 'webextension-polyfill'

interface Props {
  value: string
  onChange: (value: string) => void
}

const PromptPrefixConfig: FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
      <p className="text-sm">{Browser.i18n.getMessage('options_promptPrefix_description')}</p>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="prompt-prefix" className="block text-sm font-medium text-gray-700">
            {Browser.i18n.getMessage('options_promptPrefix_title')}
          </label>
          <textarea
            id="prompt-prefix"
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default PromptPrefixConfig
