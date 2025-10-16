import ChatGPTQuery from './ChatGPTQuery'
import logo from '../logo.png'
import Browser from 'webextension-polyfill'

interface ChatGPTCardProps {
  question: string
}

function ChatGPTCard({ question }: ChatGPTCardProps) {
  return (
    <div
      className="w-[400px] min-w-[300px] max-w-[800px] resize-x overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-black dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
      aria-label="ChatGPT Answer Card"
    >
      <div className="mb-3 flex items-center">
        <img src={logo} alt="ChatGPT" className="mr-3 h-8 w-8 rounded-lg" />
        <span className="text-lg font-semibold">
          {Browser.i18n.getMessage('ext_chatgpt_answer')}
        </span>
        <span className="flex-1" />
      </div>
      <ChatGPTQuery question={question} />
    </div>
  )
}

export default ChatGPTCard
