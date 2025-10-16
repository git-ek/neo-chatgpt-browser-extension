import { useState } from 'react'
import useSWR from 'swr'
import ChatGPTQuery from './ChatGPTQuery'
import logo from '../logo.png'
import { getProviderConfigs, ProviderConfigs, ProviderType } from '../config'

interface ChatGPTCardProps {
  question: string
}

function ChatGPTCard({ question }: ChatGPTCardProps) {
  const { data: configs } = useSWR<ProviderConfigs>('provider-configs', getProviderConfigs)

  const [userSelectedProvider, setUserSelectedProvider] = useState<ProviderType | null>(null)
  const activeProvider = userSelectedProvider ?? configs?.provider

  const tabClass = (isActive: boolean) =>
    `px-3 py-1 text-sm rounded-md focus:outline-none ${
      isActive
        ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
    }`

  return (
    <div
      className="w-[400px] min-w-[300px] max-w-[800px] resize-x overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-black dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
      aria-label="ChatGPT Answer Card"
    >
      <div className="mb-3 flex items-center">
        <img src={logo} alt="ChatGPT" className="mr-3 h-8 w-8 rounded-lg" />
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            className={tabClass(activeProvider === ProviderType.ChatGPT)}
            onClick={() => setUserSelectedProvider(ProviderType.ChatGPT)}
          >
            ChatGPT
          </button>
          <button
            className={tabClass(activeProvider === ProviderType.Gemini)}
            onClick={() => setUserSelectedProvider(ProviderType.Gemini)}
          >
            Gemini
          </button>
        </div>
        <span className="flex-1" />
      </div>
      <ChatGPTQuery question={question} activeProvider={activeProvider} />
    </div>
  )
}

export default ChatGPTCard
