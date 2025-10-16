import { GearIcon } from '@primer/octicons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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

function useResizable() {
  const { data: userConfig } = useSWR('user-config', getUserConfig)
  const cardRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({
    width: userConfig?.cardWidth ?? 800,
    height: userConfig?.cardHeight ?? 450,
  })

  // Save size to storage (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUserConfig({
        cardWidth: size.width,
        cardHeight: size.height,
      })
    }, 500)
    return () => clearTimeout(handler)
  }, [size.width, size.height])

  const handleResize = useCallback(
    (e: MouseEvent) => {
      const startSize = { ...size }
      const startPos = { x: e.clientX, y: e.clientY }

      const onMouseMove = (moveEvent: MouseEvent) => {
        e.preventDefault()
        const dx = moveEvent.clientX - startPos.x
        const dy = moveEvent.clientY - startPos.y
        setSize({ width: startSize.width + dx, height: startSize.height + dy })
      }
      const onMouseUp = () => {
        e.preventDefault()
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [size],
  )

  return { cardRef, size, handleResize }
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

  const { cardRef, size, handleResize } = useResizable()

  const answer = finalActiveTab === ProviderType.ChatGPT ? chatGPTAnswer : geminiAnswer

  const tabClass = (isActive: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-colors ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
        : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
    }`

  const error = providerConfigsError || modelsError

  return (
    <div
      id="chatgpt-card-container"
      ref={cardRef}
      className="relative z-[2147483647] flex flex-col rounded-lg border border-gray-200 bg-white text-black shadow-lg dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
      aria-label="ChatGPT Answer Card"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: '300px',
        minHeight: '200px',
      }}
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
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
      <div className="flex-1 overflow-y-auto p-4">
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
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onMouseDown={handleResize}
      />
    </div>
  )
}

export default ChatGPTCard
