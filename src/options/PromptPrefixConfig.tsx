import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import Browser from 'webextension-polyfill'
import useSWR from 'swr'
import { getUserConfig, updateUserConfig } from '../config'
import { debounce } from 'lodash-es'

interface Props {
  value: string
  onChange: (value: string) => void
}

const PromptPrefixConfig: FC<Props> = ({ value, onChange }) => {
  const { data: userConfig } = useSWR('user-config', getUserConfig)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current && userConfig) {
      textareaRef.current.style.width = `${userConfig.promptPrefixCardWidth}px`
      textareaRef.current.style.height = `${userConfig.promptPrefixCardHeight}px`
    }
  }, [userConfig])

  const debouncedUpdate = useMemo(
    () =>
      debounce((width: number, height: number) => {
        updateUserConfig({
          promptPrefixCardWidth: width,
          promptPrefixCardHeight: height,
        })
      }, 500),
    [],
  )

  const handleMouseUp = useCallback(() => {
    if (textareaRef.current) {
      debouncedUpdate(textareaRef.current.offsetWidth, textareaRef.current.offsetHeight)
    }
  }, [debouncedUpdate])

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
      <p className="text-sm">{Browser.i18n.getMessage('options_promptPrefix_description')}</p>
      <textarea
        ref={textareaRef}
        id="prompt-prefix"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={handleMouseUp}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        style={{ resize: 'both', minWidth: '200px', minHeight: '100px' }}
      />
    </div>
  )
}

export default PromptPrefixConfig
