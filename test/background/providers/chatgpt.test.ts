import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import Browser from 'webextension-polyfill'
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

    const sendMessageMock = vi.spyOn(Browser.runtime, 'sendMessage')

    // --- Step 1: Successful fetch and cache ---
    sendMessageMock.mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'test-token' },
    })

    const token1 = await getChatGPTAccessToken()
    expect(token1).toBe('test-token')
    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(mockCache.get('accessToken')).toBe('test-token')

    // --- Step 2: Second call should use the cache ---
    const token2 = await getChatGPTAccessToken()
    expect(token2).toBe('test-token')
    expect(sendMessageMock).toHaveBeenCalledTimes(1)

    // --- Step 3: Manually clear cache and test UNAUTHORIZED failure ---
    mockCache.clear()
    sendMessageMock.mockResolvedValueOnce({
      success: true,
      data: {},
    })

    await expect(getChatGPTAccessToken()).rejects.toThrow('UNAUTHORIZED')
    expect(sendMessageMock).toHaveBeenCalledTimes(2)

    // --- Step 4: Test CLOUDFLARE failure ---
    mockCache.clear()
    sendMessageMock.mockResolvedValueOnce({
      success: false,
      error: 'CLOUDFLARE',
    })
    await expect(getChatGPTAccessToken()).rejects.toThrow('CLOUDFLARE')
    expect(sendMessageMock).toHaveBeenCalledTimes(3)
  })

  it('sendMessageFeedback should make a correct request', async () => {
    const { sendMessageFeedback } = await import('../../../src/background/providers/chatgpt')
    const sendMessageMock = vi
      .spyOn(Browser.runtime, 'sendMessage')
      .mockResolvedValue({ success: true })

    const feedbackData = { message_id: '1', rating: 'thumbsUp' }
    await sendMessageFeedback('test-token', feedbackData)

    expect(sendMessageMock).toHaveBeenCalledWith({
      type: 'PROXY_FETCH',
      url: 'https://chat.openai.com/backend-api/conversation/message_feedback',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(feedbackData),
      },
    })
  })

  it('setConversationProperty should make a correct request', async () => {
    const { setConversationProperty } = await import('../../../src/background/providers/chatgpt')
    const sendMessageMock = vi
      .spyOn(Browser.runtime, 'sendMessage')
      .mockResolvedValue({ success: true })

    await setConversationProperty('test-token', 'conv-1', { is_visible: false })

    expect(sendMessageMock).toHaveBeenCalledWith({
      type: 'PROXY_FETCH',
      url: 'https://chat.openai.com/backend-api/conversation/conv-1',
      options: {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ is_visible: false }),
      },
    })
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
      vi.spyOn(Browser.runtime, 'sendMessage').mockImplementation(async (msg) => {
        if (msg.url?.includes('/models')) throw new Error('Network error')
        return { success: true, data: {} }
      })

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
      const sendMessageMock = vi
        .spyOn(Browser.runtime, 'sendMessage')
        .mockImplementation(async (msg) => {
          if (msg.url?.includes('/models'))
            return { success: true, data: { models: [{ slug: 'gpt-4' }] } }
          return { success: true, data: {} }
        })

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

      expect(sendMessageMock).toHaveBeenCalledWith({
        type: 'PROXY_FETCH',
        url: 'https://chat.openai.com/backend-api/conversation/conv-to-hide',
        options: expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ is_visible: false }),
        }),
      })
    })
  })
})
