import Browser from 'webextension-polyfill'
import { TriggerMode } from '../config'
import ChatGPTQuery from './ChatGPTQuery'
import logo from '../logo.png'

interface ChatGPTCardProps {
  question: string
  triggerMode: TriggerMode
}

function ChatGPTCard({ question, triggerMode }: ChatGPTCardProps) {
  return (
    <div className="chat-gpt-card">
      <div className="gpt-card" aria-label="ChatGPT Answer Card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img
            src={logo}
            alt="ChatGPT"
            style={{ width: 32, height: 32, borderRadius: 8, marginRight: 12 }}
          />
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>
            {Browser.i18n.getMessage('ext_chatgpt_answer')}
          </span>
          <span style={{ flex: 1 }} />
        </div>
        <ChatGPTQuery question={question} triggerMode={triggerMode} />
      </div>
    </div>
  )
}

export default ChatGPTCard
