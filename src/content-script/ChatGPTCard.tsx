import { useState } from 'preact/hooks';
import useSWRImmutable from 'swr/immutable';
import { fetchPromotion } from '../api';
import { TriggerMode } from '../config';
import ChatGPTQuery, { QueryStatus } from './ChatGPTQuery';
import Promotion from './Promotion';
import logo from '../logo.png';

interface ChatGPTCardProps {
  question: string;
  triggerMode: TriggerMode;
}

function ChatGPTCard({ question, triggerMode }: ChatGPTCardProps) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>();
  const { data: promotion } = useSWRImmutable(
    queryStatus === 'success' ? 'promotion' : null,
    fetchPromotion,
    { shouldRetryOnError: false },
  );

  return (
    <div className="chat-gpt-card">
      <div className="gpt-card" aria-label="ChatGPT Answer Card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img src={logo} alt="ChatGPT" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 12 }} />
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>ChatGPT Answer</span>
          <span style={{ flex: 1 }} />
        </div>
        <ChatGPTQuery
          question={question}
          triggerMode={triggerMode}
          onStatusChange={setQueryStatus}
        />
      </div>
      {promotion && <Promotion data={promotion} />}
    </div>
  );
}

export default ChatGPTCard;
