import { GearIcon } from '@primer/octicons-react'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import ChatGPTQuery from './ChatGPTQuery'
import {
  getProviderConfigs,
  ProviderConfigs,
  ProviderType,
  updateUserConfig,
  getUserConfig,
} from '../config'
import ChatGPTFeedback from './ChatGPTFeedback'
import { Answer } from '../messaging'
import { ConfigPanel } from '../options/components/ConfigPanel'
import { loadModels } from '../options/utils'

interface ChatGPTCardProps {
  question: string
}

type ActiveTab = ProviderType | 'settings'

function ChatGPTCard({ question }: ChatGPTCardProps) {
  // Fetch configs for both query and settings panels
  const { data: providerConfigs, error: providerConfigsError } = useSWR<ProviderConfigs>(
    'provider-configs',
    getProviderConfigs,
  )
  const { data: userConfig } = useSWR('user-config', getUserConfig)
  const { data: models, error: modelsError } = useSWR(
    () => (providerConfigs ? ['models', providerConfigs.provider] : null),
    ([, provider]) => loadModels(provider),
  )

  // This state tracks only the user's explicit tab selection within the component's lifecycle.
  const [userSelectedTab, setUserSelectedTab] = useState<ActiveTab | null>(null)

  // State for each provider's content
  const [chatGPTAnswer, setChatGPTAnswer] = useState<Answer | null>(null)
  const [geminiAnswer, setGeminiAnswer] = useState<Answer | null>(null)
  const [chatGPTError, setChatGPTError] = useState('')
  const [geminiError, setGeminiError] = useState('')

  // Derive the final active tab from state and props during render.
  const finalActiveTab = userSelectedTab || providerConfigs?.provider || ProviderType.ChatGPT

  const [width, setWidth] = useState(userConfig?.cardWidth ?? 400)
  const cardRef = useRef<HTMLDivElement>(null)

  const answer = finalActiveTab === ProviderType.ChatGPT ? chatGPTAnswer : geminiAnswer

  useEffect(() => {
    if (!cardRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width)
        setWidth(newWidth)
      }
    })

    resizeObserver.observe(cardRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const saveWidth = async () => {
      if (width !== userConfig?.cardWidth) {
        await updateUserConfig({ cardWidth: width })
      }
    }
    const timer = setTimeout(saveWidth, 500) // Debounce saving
    return () => clearTimeout(timer)
  }, [width, userConfig?.cardWidth])

  const tabClass = (isActive: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-colors ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
        : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
    }`

  const error = providerConfigsError || modelsError

  return (
    <div
      ref={cardRef}
      className="min-w-[400px] max-w-[800px] resize-x overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-black dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
      aria-label="ChatGPT Answer Card"
      style={{ width: `${width}px` }}
    >
      <div className="mb-3 flex items-center justify-between" data-testid="card-header">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <button
            className={tabClass(finalActiveTab === ProviderType.ChatGPT)}
            onClick={() => setUserSelectedTab(ProviderType.ChatGPT)}
          >
            ChatGPT
          </button>
          <button
            className={tabClass(finalActiveTab === ProviderType.Gemini)}
            onClick={() => setUserSelectedTab(ProviderType.Gemini)}
          >
            Gemini
          </button>
          <button
            className={tabClass(finalActiveTab === 'settings')}
            onClick={() => setUserSelectedTab('settings')}
            title={Browser.i18n.getMessage('ext_settings_title')}
          >
            <GearIcon size={14} />
          </button>
        </div>
        <div className="pr-1" data-testid="feedback-container">
          {answer && (
            <ChatGPTFeedback
              messageId={answer.messageId}
              conversationId={answer.conversationId}
              answerText={answer.text}
            />
          )}
        </div>
      </div>
      {error && <div className="p-2 text-red-500">{error.message}</div>}

      {/* Render each provider's query component but hide it if not active */}
      <div style={{ display: finalActiveTab === ProviderType.ChatGPT ? 'block' : 'none' }}>
        <ChatGPTQuery
          key={`${ProviderType.ChatGPT}-${question}`}
          question={question}
          activeProvider={ProviderType.ChatGPT}
          onAnswer={setChatGPTAnswer}
          onError={setChatGPTError}
          error={chatGPTError}
          onOpenSettings={() => setUserSelectedTab('settings')}
        />
      </div>
      <div style={{ display: finalActiveTab === ProviderType.Gemini ? 'block' : 'none' }}>
        <ChatGPTQuery
          key={`${ProviderType.Gemini}-${question}`}
          question={question}
          activeProvider={ProviderType.Gemini}
          onAnswer={setGeminiAnswer}
          onError={setGeminiError}
          error={geminiError}
          onOpenSettings={() => setUserSelectedTab('settings')}
        />
      </div>

      {finalActiveTab === 'settings' && // The settings tab does not need to be preserved
        (providerConfigs && models && userConfig ? (
          <div className="p-2">
            <ConfigPanel
              initialConfigs={providerConfigs}
              initialUserConfig={userConfig}
              models={models}
            />
          </div>
        ) : (
          <div className="p-2" role="status">
            Loading settings...
          </div>
        ))}
    </div>
  )
}

export default ChatGPTCard
