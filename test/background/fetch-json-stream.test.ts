import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchJSONStream } from '../../src/background/fetch-json-stream'

// Helper to create a mock ReadableStream from a string array
async function* createMockStream(lines: string[]) {
  const encoder = new TextEncoder()
  for (const line of lines) {
    yield encoder.encode(line + '\n')
  }
}

describe('background/fetch-json-stream', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should process a successful stream and call onMessage for each line', async () => {
    const mockLines = ['{"foo":"bar"}', '{"baz":"qux"}', '']
    const stream = createMockStream(mockLines)
    const mockResponse = new Response(stream as unknown as ReadableStream, { status: 200 })
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

    const onMessage = vi.fn()
    await fetchJSONStream('https://example.com', { onMessage })

    expect(onMessage).toHaveBeenCalledTimes(2) // empty line is skipped
    expect(onMessage).toHaveBeenCalledWith('{"foo":"bar"}')
    expect(onMessage).toHaveBeenCalledWith('{"baz":"qux"}')
  })

  it('should handle incomplete chunks correctly', async () => {
    const encoder = new TextEncoder()
    const stream = (async function* () {
      yield encoder.encode('{"a":1}\n{"b":2')
      yield encoder.encode('}\n{"c":3}')
    })()

    const mockResponse = new Response(stream as unknown as ReadableStream, { status: 200 })
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

    const onMessage = vi.fn()
    await fetchJSONStream('https://example.com', { onMessage })

    expect(onMessage).toHaveBeenCalledTimes(3)
    expect(onMessage).toHaveBeenCalledWith('{"a":1}')
    expect(onMessage).toHaveBeenCalledWith('{"b":2}')
    expect(onMessage).toHaveBeenCalledWith('{"c":3}')
  })

  it('should throw an error for non-ok responses with a JSON body', async () => {
    const errorPayload = { error: { message: 'Server error' } }
    const mockResponse = new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

    const onMessage = vi.fn()
    await expect(fetchJSONStream('https://example.com', { onMessage })).rejects.toThrow(
      JSON.stringify(errorPayload),
    )
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('should throw an error for non-ok responses without a JSON body', async () => {
    const mockResponse = new Response('Internal Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    })
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

    const onMessage = vi.fn()
    await expect(fetchJSONStream('https://example.com', { onMessage })).rejects.toThrow(
      '500 Internal Server Error',
    )
  })
})
