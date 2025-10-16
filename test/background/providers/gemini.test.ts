import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiProvider } from '../../../src/background/providers/gemini'
import { fetchJSONStream } from '../../../src/background/fetch-json-stream'

// Mock the fetchJSONStream function
vi.mock('../../../src/background/fetch-json-stream')

describe('GeminiProvider', () => {
  const model = 'gemini-pro'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call fetchJSONStream with correct parameters', async () => {
    const provider = new GeminiProvider('test-api-key', model)
    const prompt = 'Hello Gemini!'

    // Mock the generator
    const mockGenerator = (async function* () {})()
    vi.mocked(fetchJSONStream).mockReturnValue(mockGenerator)

    await provider.generateAnswer({ prompt, onEvent: () => {} })

    expect(fetchJSONStream).toHaveBeenCalledOnce()
    const [url, options] = vi.mocked(fetchJSONStream).mock.calls[0]

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

    // Simulate the behavior of fetchJSONStream by calling onMessage
    vi.mocked(fetchJSONStream).mockImplementation(async (url, options) => {
      options.onMessage(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Hel' }] } }] }))
      options.onMessage(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'lo' }] } }] }))
      options.onMessage(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: ' world' }] } }] }),
      )
      options.onMessage(JSON.stringify({ candidates: null })) // Should be ignored
    })

    await provider.generateAnswer({ prompt, onEvent })

    expect(onEvent).toHaveBeenCalledTimes(4) // 3 answer events + 1 done event

    // Check 'answer' events
    expect(onEvent).toHaveBeenCalledWith({ type: 'answer', data: { text: 'Hel' } })
    expect(onEvent).toHaveBeenCalledWith({ type: 'answer', data: { text: 'Hello' } })
    expect(onEvent).toHaveBeenCalledWith({ type: 'answer', data: { text: 'Hello world' } })

    // Check 'done' event
    expect(onEvent).toHaveBeenCalledWith({ type: 'done' })
  })
})
