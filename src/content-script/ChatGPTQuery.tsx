import { GearIcon } from '@primer/octicons-react'
import { Tabs, Spinner } from '@geist-ui/core'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
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
}

export type QueryStatus = 'success' | 'error' | undefined

function ChatGPTQuery({ question }: Props) {
  const { data: configs, error: configsError } = useSWR<ProviderConfigs>(
    'provider-configs',
    getProviderConfigs,
  )

  const [activeProvider, setActiveProvider] = useState<ProviderType | null>(null)
  useEffect(() => {
    if (configs && !activeProvider) {
      setActiveProvider(configs.provider)
    }
  }, [configs, activeProvider])

  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState<QueryStatus>()

  useEffect(() => {
    if (!activeProvider) {
      return
    }
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
    return (
      <div className="gpt-error-message">{Browser.i18n.getMessage('ext_error_load_settings')}</div>
    )
  }

  const renderContent = () => {
    if (!configs || !activeProvider) {
      return <Spinner />
    }

    const isChatGPTApi =
      activeProvider === ProviderType.ChatGPT && configs.configs.chatgpt.mode === ChatGPTMode.API
    const isGeminiApi = activeProvider === ProviderType.Gemini
    const apiKeyMissing =
      (isChatGPTApi && !configs.configs.chatgpt.apiKey) ||
      (isGeminiApi && !configs.configs.gemini.apiKey)

    if (apiKeyMissing) {
      return (
        <p>
          {Browser.i18n.getMessage('ext_apikey_not_set', activeProvider.toUpperCase())}{' '}
          <a href="#" onClick={openOptionsPage}>
            {Browser.i18n.getMessage('ext_apikey_link_to_options')}
          </a>
        </p>
      )
    }

    if (answer) {
      return (
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
      )
    }

    if (error) {
      const messageKey = getErrorMessageKey(error)
      const helpMsg = Browser.i18n.getMessage(messageKey)
      return (
        <div className="gpt-error-message">
          <span className="font-bold">{Browser.i18n.getMessage('ext_error_prefix')}</span>
          <span className="break-all block">{error}</span>
          <div className="mt-2 text-xs">
            <span>{helpMsg}</span>
          </div>
        </div>
      )
    }

    return (
      <p className="text-[#b6b8ba] animate-pulse">
        {Browser.i18n.getMessage('ext_waiting_for_response')}
      </p>
    )
  }

  return (
    <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
      <div className="gpt-header">
        <Tabs
          value={activeProvider || ''}
          onChange={(v) => setActiveProvider(v as ProviderType)}
          className="flex-grow"
        >
          <Tabs.Item
            label={Browser.i18n.getMessage('ext_chatgpt_short')}
            value={ProviderType.ChatGPT}
          />
          <Tabs.Item
            label={Browser.i18n.getMessage('ext_provider_gemini_api')}
            value={ProviderType.Gemini}
          />
        </Tabs>
        <span className="cursor-pointer p-2" onClick={openOptionsPage}>
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
      <div className="p-2">{renderContent()}</div>
    </div>
  )
}

export default memo(ChatGPTQuery)
