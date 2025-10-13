import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'

interface ErrorEvent {
  error: string
  code?: string
}
import ChatGPTFeedback from './ChatGPTFeedback'
import { isBraveBrowser } from './utils.js'

export type QueryStatus = 'success' | 'error' | undefined

interface Props {
  question: string
  onStatusChange?: (status: QueryStatus) => void
}

function ChatGPTQuery(props: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState<QueryStatus>()

  useEffect(() => {
    props.onStatusChange?.(status)
  }, [props, status])

  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = (msg: Answer | ErrorEvent | { event?: string }) => {
      if ('text' in msg) {
        setAnswer(msg as Answer)
        setStatus('success')
      } else if ('error' in msg) {
        setError(msg.error)
        setStatus('error')
      }
    }
    port.onMessage.addListener(listener)
    port.postMessage({ question: props.question })
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [props.question, retry])

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
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
  }, [props.question, status])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  if (answer) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">
          <span className="font-bold">{Browser.i18n.getMessage('ext_chatgpt_short')}</span>
          <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={14} />
          </span>
          <ChatGPTFeedback
            messageId={answer.messageId}
            conversationId={answer.conversationId}
            answerText={answer.text}
          />
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
      </div>
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
    // 에러 코드별 안내 강화
    let helpMsg = Browser.i18n.getMessage('ext_error_generic')
    if (error.includes('network') || error.includes('Failed to fetch')) {
      helpMsg = Browser.i18n.getMessage('ext_error_network')
    } else if (error.includes('model')) {
      helpMsg = Browser.i18n.getMessage('ext_error_model')
    } else if (error.includes('API key') || error.includes('unauthorized')) {
      helpMsg = Browser.i18n.getMessage('ext_error_apikey')
    }
    return (
      <div
        className="gpt-error-message"
        style={{
          color: '#d32f2f',
          background: '#fff0f0',
          border: '1px solid #d32f2f',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '8px',
        }}
      >
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
          {Browser.i18n.getMessage('ext_error_prefix')}
        </span>
        <span className="break-all block">{error}</span>
        <div style={{ marginTop: '8px', fontSize: '0.95em' }}>
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

export default memo(ChatGPTQuery)
