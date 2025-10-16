import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiProvider } from '../../../src/background/providers/gemini'

describe('GeminiProvider', () => {
  const model = 'gemini-pro'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call fetch with correct parameters', async () => {
    const provider = new GeminiProvider('test-api-key', model)
    const prompt = 'Hello Gemini!'

    const mockResponse = new Response(
      new ReadableStream({
        start(controller) {
          controller.close()
        },
      }),
    )
    const fetchMock = vi.fn().mockResolvedValue(mockResponse)
    vi.stubGlobal('fetch', fetchMock)

    await provider.generateAnswer({ prompt, onEvent: () => {} })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]

    expect(url).toBe(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`,
    )
    expect(options.headers?.['x-goog-api-key']).toBe('test-api-key')

    const body = JSON.parse(options.body as string)
    expect(body.contents[0].role).toBe('user')
    expect(body.contents[0].parts[0].text).toBe(prompt)
  })

  it('should handle and parse JSON stream events correctly', async () => {
    const provider = new GeminiProvider('test-api-key', model)
    const prompt = 'Test prompt'
    const onEvent = vi.fn()

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Hel' }] } }] }) + '\n',
          ),
        )
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: 'lo' }] } }] }) + '\n',
          ),
        )
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: ' world' }] } }] }) + '\n',
          ),
        )
        controller.enqueue(encoder.encode(JSON.stringify({ candidates: null }) + '\n')) // Should be ignored
        controller.close()
      },
    })

    const mockResponse = new Response(stream)
    const fetchMock = vi.fn().mockResolvedValue(mockResponse)
    vi.stubGlobal('fetch', fetchMock)

    await provider.generateAnswer({ prompt, onEvent })

    expect(onEvent).toHaveBeenCalledTimes(4) // 3 'answer' events + 1 'done' event

    // Check 'answer' events
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: expect.objectContaining({ text: 'Hel' }),
    })
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: expect.objectContaining({ text: 'Hello' }),
    })
    expect(onEvent).toHaveBeenCalledWith({
      type: 'answer',
      data: expect.objectContaining({ text: 'Hello world' }),
    })

    // Check 'done' event
    expect(onEvent).toHaveBeenCalledWith({ type: 'done' })
  })
})
