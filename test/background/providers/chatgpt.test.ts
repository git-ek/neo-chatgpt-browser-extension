import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { fetchSSE } from '../../../src/background/fetch-sse'

// Mock dependencies that are not dynamically imported
vi.mock('../../../src/background/fetch-sse')

describe('ChatGPT Provider related tests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.doUnmock('expiry-map')
    vi.resetModules() // Reset modules to ensure clean state for dynamic imports
  })

  it('getChatGPTAccessToken should correctly fetch, cache, and handle errors', async () => {
    const mockCache = new Map()
    vi.doMock('expiry-map', () => ({
      default: class ExpiryMap {
        constructor() {
          return mockCache
        }
      },
    }))

    const { getChatGPTAccessToken } = await import('../../../src/background/providers/chatgpt')

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    // --- Step 1: Successful fetch and cache ---
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ accessToken: 'test-token' }),
    } as Response)

    const token1 = await getChatGPTAccessToken()
    expect(token1).toBe('test-token')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(mockCache.get('accessToken')).toBe('test-token')

    // --- Step 2: Second call should use the cache ---
    const token2 = await getChatGPTAccessToken()
    expect(token2).toBe('test-token')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // --- Step 3: Manually clear cache and test UNAUTHORIZED failure ---
    mockCache.clear()
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    } as Response)

    await expect(getChatGPTAccessToken()).rejects.toThrow('UNAUTHORIZED')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // --- Step 4: Test CLOUDFLARE failure ---
    mockCache.clear()
    fetchMock.mockResolvedValueOnce({ status: 403 } as Response)
    await expect(getChatGPTAccessToken()).rejects.toThrow('CLOUDFLARE')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('sendMessageFeedback should make a correct request', async () => {
    const { sendMessageFeedback } = await import('../../../src/background/providers/chatgpt')
    const fetchMock = vi.fn().mockResolvedValue({} as Response)
    vi.stubGlobal('fetch', fetchMock)

    const feedbackData = { message_id: '1', rating: 'thumbsUp' }
    await sendMessageFeedback('test-token', feedbackData)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://chat.openai.com/backend-api/conversation/message_feedback',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(feedbackData),
      },
    )
  })

  it('setConversationProperty should make a correct request', async () => {
    const { setConversationProperty } = await import('../../../src/background/providers/chatgpt')
    const fetchMock = vi.fn().mockResolvedValue({} as Response)
    vi.stubGlobal('fetch', fetchMock)

    await setConversationProperty('test-token', 'conv-1', { is_visible: false })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://chat.openai.com/backend-api/conversation/conv-1',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ is_visible: false }),
      },
    )
  })

  describe('ChatGPTProvider', () => {
    let ChatGPTProvider

    beforeEach(async () => {
      vi.doMock('expiry-map', () => ({
        default: class ExpiryMap {},
      }))
      const module = await import('../../../src/background/providers/chatgpt')
      ChatGPTProvider = module.ChatGPTProvider
    })

    it('should use fallback model if model fetch fails', async () => {
      const fetchMock = vi.fn().mockImplementation(async (url) => {
        if (url.includes('/models')) {
          throw new Error('Network error')
        }
        return { status: 200, json: async () => ({}) } as Response
      })
      vi.stubGlobal('fetch', fetchMock)

      const provider = new ChatGPTProvider('test-token')
      vi.mocked(fetchSSE).mockImplementation(async (url, options) => {
        options.onMessage('[DONE]')
      })

      await provider.generateAnswer({ prompt: 'test', onEvent: () => {} })

      const [, options] = vi.mocked(fetchSSE).mock.calls[0]
      const body = JSON.parse(options.body as string)
      expect(body.model).toBe('text-davinci-002-render')
    })

    it('should parse events correctly', () => {
      const provider = new ChatGPTProvider('test-token')
      const message = JSON.stringify({
        message: {
          id: 'message-1',
          content: { parts: ['Hello'] },
        },
        conversation_id: 'conv-1',
      })
      const parsed = provider.parseEvent(message)
      expect(parsed).toEqual({
        text: 'Hello',
        messageId: 'message-1',
        conversationId: 'conv-1',
      })
    })

    it('should call cleanup function to hide conversation', async () => {
      const fetchMock = vi.fn().mockImplementation(async (url) => {
        if (url.includes('/models')) {
          return { status: 200, json: async () => ({ models: [{ slug: 'gpt-4' }] }) } as Response
        }
        return { status: 200, json: async () => ({}) } as Response
      })
      vi.stubGlobal('fetch', fetchMock)

      const provider = new ChatGPTProvider('test-token')
      vi.mocked(fetchSSE).mockResolvedValue(undefined)

      // Manually set conversationId by parsing an event
      const message = JSON.stringify({
        message: { id: 'msg1', content: { parts: ['Hello'] } },
        conversation_id: 'conv-to-hide',
      })
      provider.parseEvent(message)

      const { cleanup } = await provider.generateAnswer({ prompt: 'test', onEvent: () => {} })
      await cleanup()

      expect(fetchMock).toHaveBeenCalledWith(
        'https://chat.openai.com/backend-api/conversation/conv-to-hide',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ is_visible: false }) }),
      )
    })
  })
})
