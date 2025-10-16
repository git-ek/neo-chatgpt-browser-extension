import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState, memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { getProviderConfigs, ProviderConfigs, ProviderType, ChatGPTMode } from '../config'
import { Answer } from '../messaging'
import ChatGPTFeedback from './ChatGPTFeedback'
import { getErrorMessageKey } from './utils.js'

interface Props {
  question: string
  triggerMode?: string // triggerMode is passed but not used in this component anymore
}

export type QueryStatus = 'success' | 'error' | undefined

function ChatGPTQuery({ question }: Props) {
  const { data: configs, error: configsError } = useSWR<ProviderConfigs>(
    'provider-configs',
    getProviderConfigs,
  )

  const [userSelectedProvider, setUserSelectedProvider] = useState<ProviderType | null>(null)
  const activeProvider = userSelectedProvider ?? configs?.provider

  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState<QueryStatus>()

  useEffect(() => {
    if (!activeProvider) {
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer(null)
    setError('')
    setStatus(undefined)

    const port = Browser.runtime.connect()
    const listener = (msg: Answer | { error: string } | { event: string }) => {
      if ('text' in msg) {
        setAnswer(msg)
        setStatus('success')
      } else if ('error' in msg) {
        setError(msg.error)
        setStatus('error')
      }
    }
    port.onMessage.addListener(listener)
    port.postMessage({ question, provider: activeProvider })
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [question, retry, activeProvider])

  useEffect(() => {
    const onFocus = () => {
      if (error && (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    if (status === 'success') {
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [question, status])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  if (configsError) {
    return <div className="text-red-500">{Browser.i18n.getMessage('ext_error_load_settings')}</div>
  }

  const renderContent = () => {
    if (!configs || !activeProvider) {
      return (
        <p className="animate-pulse text-gray-400 dark:text-gray-500">
          {Browser.i18n.getMessage('ext_waiting_for_response')}
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
          {Browser.i18n.getMessage('ext_apikey_not_set', activeProvider.toUpperCase())}{' '}
          <a href="#" onClick={openOptionsPage} className="underline">
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
        {Browser.i18n.getMessage('ext_waiting_for_response')}
      </p>
    )
  }

  const tabClass = (isActive: boolean) =>
    `px-3 py-1 text-sm rounded-md focus:outline-none ${
      isActive
        ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
    }`

  return (
    <div id="gpt-answer" dir="auto">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            className={tabClass(activeProvider === ProviderType.ChatGPT)}
            onClick={() => setUserSelectedProvider(ProviderType.ChatGPT)}
          >
            {Browser.i18n.getMessage('ext_chatgpt_short')}
          </button>
          <button
            className={tabClass(activeProvider === ProviderType.Gemini)}
            onClick={() => setUserSelectedProvider(ProviderType.Gemini)}
          >
            {Browser.i18n.getMessage('ext_provider_gemini_label')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={openOptionsPage}
          >
            <GearIcon size={14} />
          </span>
          {answer && (
            <ChatGPTFeedback
              messageId={answer.messageId}
              conversationId={answer.conversationId}
              answerText={answer.text}
            />
          )}
        </div>
      </div>
      <div className="p-1 text-sm">{renderContent()}</div>
    </div>
  )
}

export default memo(ChatGPTQuery)
