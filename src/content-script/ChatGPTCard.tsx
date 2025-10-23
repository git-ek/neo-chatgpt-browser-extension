import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { debounce } from 'lodash-es'
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
  const { data: userConfig, mutate: mutateUserConfig } = useSWR('user-config', getUserConfig)
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

  // --- Start of resizing logic for content area ---
  const contentRef = useRef<HTMLDivElement>(null)
  const [size] = useState(userConfig ?? { width: 800, height: 450 })

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.width = `${size.width}px`
      contentRef.current.style.height = `${size.height}px`
    }
  }, [size])

  const debouncedUpdate = useMemo(
    () =>
      debounce((width: number, height: number) => {
        updateUserConfig({ cardWidth: width, cardHeight: height }).then(() => {
          mutateUserConfig() // Revalidate userConfig after update
        })
      }, 500),
    [mutateUserConfig],
  )

  const handleMouseUp = useCallback(() => {
    if (contentRef.current) {
      debouncedUpdate(contentRef.current.offsetWidth, contentRef.current.offsetHeight)
    }
  }, [debouncedUpdate])
  // --- End of new resizing logic ---

  const answer = finalActiveTab === ProviderType.ChatGPT ? chatGPTAnswer : geminiAnswer

  const error = providerConfigsError || modelsError

  const activeTabClass =
    'whitespace-nowrap border-b-2 border-blue-500 py-3 px-1 text-sm font-medium text-blue-600 dark:text-blue-400 dark:border-blue-400'
  const inactiveTabClass =
    'whitespace-nowrap border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'

  return (
    <div
      id="chatgpt-card-container"
      className="relative z-[2147483647] flex flex-col rounded-lg border border-gray-200 bg-white text-black shadow-md dark:border-gray-700 dark:bg-[#202124] dark:text-white"
      aria-label="ChatGPT Answer Card"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setUserSelectedTab(ProviderType.ChatGPT)}
            className={finalActiveTab === ProviderType.ChatGPT ? activeTabClass : inactiveTabClass}
          >
            ChatGPT
          </button>
          <button
            onClick={() => setUserSelectedTab(ProviderType.Gemini)}
            className={finalActiveTab === ProviderType.Gemini ? activeTabClass : inactiveTabClass}
          >
            Gemini
          </button>
          <button
            onClick={() => setUserSelectedTab('settings')}
            className={finalActiveTab === 'settings' ? activeTabClass : inactiveTabClass}
          >
            Settings
          </button>
        </nav>
        <div className="py-2" data-testid="feedback-container">
          {answer && (
            <ChatGPTFeedback
              messageId={answer.messageId}
              conversationId={answer.conversationId}
              answerText={answer.text}
            />
          )}
        </div>
      </div>
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        className="flex-1 p-4"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          resize: 'both',
          overflow: 'auto',
        }}
      >
        {error && <div className="p-2 text-red-500">{error.message}</div>}

        <div style={{ display: finalActiveTab === ProviderType.ChatGPT ? 'block' : 'none' }}>
          <ChatGPTQuery
            question={question}
            activeProvider={ProviderType.ChatGPT}
            answer={chatGPTAnswer}
            onAnswer={setChatGPTAnswer}
            onError={setChatGPTError}
            error={chatGPTError}
            onOpenSettings={() => setUserSelectedTab('settings')}
          />
        </div>
        <div style={{ display: finalActiveTab === ProviderType.Gemini ? 'block' : 'none' }}>
          <ChatGPTQuery
            question={question}
            activeProvider={ProviderType.Gemini}
            answer={geminiAnswer}
            onAnswer={setGeminiAnswer}
            onError={setGeminiError}
            error={geminiError}
            onOpenSettings={() => setUserSelectedTab('settings')}
          />
        </div>

        {finalActiveTab === 'settings' &&
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
    </div>
  )
}

export default ChatGPTCard
