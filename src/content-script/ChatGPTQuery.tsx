import { useEffect, useState, memo, FC } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { getProviderConfigs, ProviderConfigs, ProviderType, ChatGPTMode } from '../config'
import { Answer } from '../messaging'
import { getErrorMessageKey, upperFirst } from './utils.js'

interface Props {
  question: string
  activeProvider?: ProviderType
  answer: Answer | null
  onAnswer: (answer: Answer | null) => void
  onError: (error: string) => void
  error: string
  onOpenSettings: () => void
}

export type QueryStatus = 'success' | 'error' | undefined

const ChatGPTQuery: FC<Props> = ({
  question,
  activeProvider,
  answer,
  onAnswer,
  onError,
  error,
  onOpenSettings,
}) => {
  const { data: configs, error: configsError } = useSWR<ProviderConfigs>(
    'provider-configs',
    getProviderConfigs,
  )

  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState<QueryStatus>(answer ? 'success' : undefined)

  useEffect(() => {
    if (!activeProvider || answer) {
      return
    }

    const port = Browser.runtime.connect()
    const listener = (msg: Answer | { error: string } | { event: string }) => {
      if ('text' in msg) {
        onAnswer(msg)
        setStatus('success')
      } else if ('error' in msg) {
        // Clear previous answer when a new error comes
        onAnswer(null)
        onError(msg.error)
        setStatus('error')
      }
    }
    port.onMessage.addListener(listener)

    port.postMessage({ question, provider: activeProvider })

    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, retry, activeProvider, onAnswer, onError])

  useEffect(() => {
    const onFocus = () => {
      if (error && (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        onError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error, onError])

  useEffect(() => {
    if (status === 'success') {
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [question, status])

  if (configsError) {
    return <div className="text-red-500">{Browser.i18n.getMessage('ext_error_load_settings')}</div>
  }

  const renderContent = () => {
    if (!configs || !activeProvider) {
      return (
        <p className="animate-pulse text-gray-400 dark:text-gray-500">
          {Browser.i18n.getMessage('ext_waiting_for_response', upperFirst(activeProvider))}
        </p>
      )
    }

    const isChatGPTApi =
      activeProvider === ProviderType.ChatGPT && configs.configs.chatgpt.mode === ChatGPTMode.API
    const isGeminiApi = activeProvider === ProviderType.Gemini
    const apiKeyMissing =
      (isChatGPTApi && !configs.configs.chatgpt.apiKey) ||
      (isGeminiApi && !configs.configs.gemini.apiKey)

    if (apiKeyMissing) {
      return (
        <p className="text-sm">
          {Browser.i18n.getMessage('ext_apikey_not_set', activeProvider.toUpperCase())}
          <a href="#" onClick={onOpenSettings} className="underline">
            {Browser.i18n.getMessage('ext_apikey_link_to_options')}
          </a>
        </p>
      )
    }

    if (answer) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-pre:bg-gray-100 prose-pre:p-2 dark:prose-pre:bg-gray-800">
          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {answer.text}
          </ReactMarkdown>
        </div>
      )
    }

    if (error) {
      const messageKey = getErrorMessageKey(error)
      const helpMsg = Browser.i18n.getMessage(messageKey)
      return (
        <div className="text-red-500">
          <p className="font-bold">{Browser.i18n.getMessage('ext_error_prefix')}</p>
          <p className="block break-all">{error}</p>
          <div className="mt-2 text-xs text-gray-500">
            <span>{helpMsg}</span>
          </div>
        </div>
      )
    }

    return (
      <p className="animate-pulse text-gray-400 dark:text-gray-500">
        {Browser.i18n.getMessage('ext_waiting_for_response', upperFirst(activeProvider))}
      </p>
    )
  }

  return (
    <div id="gpt-answer" dir="auto" className="p-1 text-sm">
      <div className="p-1 text-sm">{renderContent()}</div>
    </div>
  )
}

export default memo(ChatGPTQuery)
