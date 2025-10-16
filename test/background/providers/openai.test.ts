import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIProvider } from '../../../src/background/providers/openai'
import { fetchSSE } from '../../../src/background/fetch-sse'

// Mock the fetchSSE function
vi.mock('../../../src/background/fetch-sse')

describe('OpenAIProvider', () => {
  const model = 'text-davinci-003'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call fetchSSE with correct parameters', async () => {
    const provider = new OpenAIProvider('test-token', model)
    const prompt = 'Hello, world!'

    // The mock implementation is not important for this test, only that it's called
    vi.mocked(fetchSSE).mockResolvedValue()

    await provider.generateAnswer({ prompt, onEvent: () => {} })

    expect(fetchSSE).toHaveBeenCalledOnce()
    const [url, options] = vi.mocked(fetchSSE).mock.calls[0]

    expect(url).toBe('https://api.openai.com/v1/completions')
    expect(options.headers?.Authorization).toBe('Bearer test-token')

    const body = JSON.parse(options.body as string)
    expect(body.model).toBe(model)
    expect(body.prompt).toBe(prompt)
    expect(body.stream).toBe(true)
  })

  it('should handle and parse SSE events correctly', async () => {
    const provider = new OpenAIProvider('test-token', model)
    const prompt = 'Test prompt'
    const onEvent = vi.fn()

    // Simulate the behavior of fetchSSE by calling onMessage
    vi.mocked(fetchSSE).mockImplementation(async (url, options) => {
      options.onMessage('{"id":"cmpl-123","choices":[{"text":"Hello"}]}')
      options.onMessage('{"id":"cmpl-123","choices":[{"text":", "}]}')
      options.onMessage('{"id":"cmpl-123","choices":[{"text":"world!"}]}')
      options.onMessage('{"id":"cmpl-123","choices":[{"text":"<|im_end|>"}]}') // Should be ignored
      options.onMessage('[DONE]')
    })

    await provider.generateAnswer({ prompt, onEvent })

    // 3 valid messages + 1 'done' event
    expect(onEvent).toHaveBeenCalledTimes(4)

    // Check 'answer' events
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: { text: 'Hello', messageId: 'cmpl-123', conversationId: 'cmpl-123' },
    })
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: { text: 'Hello, ', messageId: 'cmpl-123', conversationId: 'cmpl-123' },
    })
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: { text: 'Hello, world!', messageId: 'cmpl-123', conversationId: 'cmpl-123' },
    })

    // Check 'done' event
    expect(onEvent).toHaveBeenCalledWith({ type: 'done' })
  })

  it('should build a special prompt for chat models', async () => {
    const chatModel = 'text-chat-davinci-002-20221122'
    const provider = new OpenAIProvider('test-token', chatModel)
    const prompt = 'What is love?'

    vi.mocked(fetchSSE).mockResolvedValue()

    await provider.generateAnswer({ prompt, onEvent: () => {} })

    expect(fetchSSE).toHaveBeenCalledOnce()
    const [, options] = vi.mocked(fetchSSE).mock.calls[0]
    const body = JSON.parse(options.body as string)

    const expectedPrompt = `Respond conversationally.<|im_end|>

User: ${prompt}<|im_sep|>
ChatGPT:`
    expect(body.prompt).toBe(expectedPrompt)
  })
})
