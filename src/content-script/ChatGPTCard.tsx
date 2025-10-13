import { useState } from 'preact/hooks';
import ChatGPTQuery, { QueryStatus } from './ChatGPTQuery';
import logo from '../logo.png';


interface ChatGPTCardProps {
  question: string;
  onStatusChange: (status: QueryStatus) => void;
}

function ChatGPTCard({ question, onStatusChange }: ChatGPTCardProps) {
  return (
    <>
      <div
        className="gpt-card"
        aria-label="ChatGPT Answer Card"
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img src={logo} alt="ChatGPT" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 12 }} />
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>ChatGPT Answer</span>
          <span style={{ flex: 1 }} />
        </div>
        <ChatGPTQuery question={question} onStatusChange={onStatusChange} />
      </div>
      {/* 스타일은 styles.scss에서 관리 */}
    </>
  );
}

export default ChatGPTCard;
