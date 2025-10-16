import { ThumbsdownIcon, ThumbsupIcon, CopyIcon, CheckIcon } from '@primer/octicons-react'
import { memo, useCallback, useState } from 'react'
import { useEffect } from 'preact/hooks'
import Browser from 'webextension-polyfill'

interface Props {
  messageId: string
  conversationId: string
  answerText: string
}

function ChatGPTFeedback(props: Props) {
  const [copied, setCopied] = useState(false)
  const [action, setAction] = useState<'thumbsUp' | 'thumbsDown' | null>(null)

  const clickThumbsUp = useCallback(async () => {
    if (action) {
      return
    }
    setAction('thumbsUp')
    await Browser.runtime.sendMessage({
      type: 'FEEDBACK',
      data: {
        conversation_id: props.conversationId,
        message_id: props.messageId,
        rating: 'thumbsUp',
      },
    })
  }, [action, props.conversationId, props.messageId])

  const clickThumbsDown = useCallback(async () => {
    if (action) {
      return
    }
    setAction('thumbsDown')
    await Browser.runtime.sendMessage({
      type: 'FEEDBACK',
      data: {
        conversation_id: props.conversationId,
        message_id: props.messageId,
        rating: 'thumbsDown',
        text: '',
        tags: [],
      },
    })
  }, [action, props.conversationId, props.messageId])

  const clickCopyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(props.answerText)
    setCopied(true)
  }, [props.answerText])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <div className="flex cursor-pointer gap-1.5">
      <span onClick={clickThumbsUp} className={action === 'thumbsUp' ? 'text-red-500' : ''}>
        <ThumbsupIcon size={14} />
      </span>
      <span onClick={clickThumbsDown} className={action === 'thumbsDown' ? 'text-red-500' : ''}>
        <ThumbsdownIcon size={14} />
      </span>
      <span onClick={clickCopyToClipboard} className="ml-auto">
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      </span>
    </div>
  )
}

export default memo(ChatGPTFeedback)
