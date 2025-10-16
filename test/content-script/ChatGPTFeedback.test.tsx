import { render, screen, fireEvent, act } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ChatGPTFeedback from '../../src/content-script/ChatGPTFeedback'
import Browser from 'webextension-polyfill'

// Mock the icon components
vi.mock('@primer/octicons-react', () => ({
  ThumbsupIcon: () => <div data-testid="thumbs-up" />,
  ThumbsdownIcon: () => <div data-testid="thumbs-down" />,
  CopyIcon: () => <div data-testid="copy-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
}))

describe('ChatGPTFeedback', () => {
  const mockProps = {
    messageId: 'test-message-id',
    conversationId: 'test-conv-id',
    answerText: 'This is the answer',
  }

  // Mock clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
  })

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render initial state correctly', () => {
    render(<ChatGPTFeedback {...mockProps} />)
    expect(screen.getByTestId('thumbs-up')).toBeInTheDocument()
    expect(screen.getByTestId('thumbs-down')).toBeInTheDocument()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
  })

  it('should handle thumbs up click', async () => {
    render(<ChatGPTFeedback {...mockProps} />)
    const thumbsUpButton = screen.getByTestId('thumbs-up').parentElement!

    await act(async () => {
      fireEvent.click(thumbsUpButton)
    })

    expect(Browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'FEEDBACK',
      data: {
        conversation_id: mockProps.conversationId,
        message_id: mockProps.messageId,
        rating: 'thumbsUp',
      },
    })
    expect(thumbsUpButton.classList.contains('text-red-500')).toBe(true)

    // Second click should do nothing
    await act(async () => {
      fireEvent.click(thumbsUpButton)
    })
    expect(Browser.runtime.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('should handle thumbs down click', async () => {
    render(<ChatGPTFeedback {...mockProps} />)
    const thumbsDownButton = screen.getByTestId('thumbs-down').parentElement!

    await act(async () => {
      fireEvent.click(thumbsDownButton)
    })

    expect(Browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'FEEDBACK',
      data: {
        conversation_id: mockProps.conversationId,
        message_id: mockProps.messageId,
        rating: 'thumbsDown',
        text: '',
        tags: [],
      },
    })
    expect(thumbsDownButton.classList.contains('text-red-500')).toBe(true)
  })

  it('should handle copy to clipboard click', async () => {
    render(<ChatGPTFeedback {...mockProps} />)
    const copyButton = screen.getByTestId('copy-icon').parentElement!

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProps.answerText)
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()

    // Fast-forward time
    await act(async () => {
      vi.runAllTimers()
    })

    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
  })
})
