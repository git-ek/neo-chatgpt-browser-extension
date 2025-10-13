import { GearIcon } from '@primer/octicons-react'
import { Tabs } from '@geist-ui/core'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { getProviderConfigs, ProviderConfigs, ProviderType } from '../config'
import { Answer } from '../messaging'
import ChatGPTFeedback from './ChatGPTFeedback'
import { getErrorMessageKey, isBraveBrowser } from './utils.js'

interface Props {
  question: string
  onStatusChange?: (status: QueryStatus) => void
}

export type QueryStatus = 'success' | 'error' | undefined

function ChatGPTQuery({ question, onStatusChange }: Props) {
  const { data: configs } = useSWR<ProviderConfigs>('provider-configs', getProviderConfigs)

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
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    if (!activeProvider) {
      return
    }
    setAnswer(null)
    setError('')
    setStatus(undefined)

    const port = Browser.runtime.connect()
    const listener = (msg: Answer | { error: string } | { event: string }) => {
      if (msg.text) {
        setAnswer(msg)
        setStatus('success')
      } else if (msg.error) {
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

  const renderContent = () => {
    if (
      (activeProvider === ProviderType.GPT3 && !configs?.configs[ProviderType.GPT3]?.apiKey) ||
      (activeProvider === ProviderType.Gemini && !configs?.configs[ProviderType.Gemini]?.apiKey)
    ) {
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

    if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
      return (
        <p>
          {Browser.i18n.getMessage('ext_cloudflare_login')}{' '}
          <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
            chat.openai.com
          </a>
          {retry > 0 &&
            (() => {
              if (isBraveBrowser()) {
                return (
                  <span className="block mt-2">
                    {Browser.i18n.getMessage('ext_still_not_working')}{' '}
                    <p className="text-xs text-gray-500 gpt-feedback">
                      {Browser.i18n.getMessage('ext_troubleshooting')}{' '}
                      <a href="https://github.com/git-ek/neo-chatgpt-browser-extension#troubleshooting">
                        {Browser.i18n.getMessage('ext_common_issues')}
                      </a>
                    </p>
                  </span>
                )
              } else {
                return (
                  <span className="italic block mt-2 text-xs">
                    {Browser.i18n.getMessage('ext_openai_security_check')}
                  </span>
                )
              }
            })()}
        </p>
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
        <span className="font-bold">{Browser.i18n.getMessage('ext_chatgpt_short')}</span>
        <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
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
      <Tabs
        value={activeProvider || ''}
        onChange={(v) => setActiveProvider(v as ProviderType)}
        className="mb-2"
      >
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_chatgpt_webapp')}
          value={ProviderType.ChatGPT}
        />
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_openai_api')}
          value={ProviderType.GPT3}
        />
        <Tabs.Item
          label={Browser.i18n.getMessage('ext_provider_gemini_api')}
          value={ProviderType.Gemini}
        />
      </Tabs>
      {renderContent()}
    </div>
  )
}

export default memo(ChatGPTQuery)
