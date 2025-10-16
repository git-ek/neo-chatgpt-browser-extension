import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchSSE } from '../../src/background/fetch-sse'

// Helper to create a mock ReadableStream from an array of strings
function createMockStream(data: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let i = 0
  return new ReadableStream({
    pull(controller) {
      if (i < data.length) {
        controller.enqueue(encoder.encode(data[i]))
        i++
      } else {
        controller.close()
      }
    },
  })
}

describe('fetchSSE', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should process stream and call onMessage for each event', async () => {
    const mockStream = createMockStream(['data: chunk1\n\n', 'data: chunk2\n\n'])
    const fetchMock = vi.fn().mockResolvedValue(new Response(mockStream))
    vi.stubGlobal('fetch', fetchMock)

    const onMessage = vi.fn()
    await fetchSSE('https://test.com/sse', { onMessage })

    expect(onMessage).toHaveBeenCalledTimes(2)
    expect(onMessage).toHaveBeenCalledWith('chunk1')
    expect(onMessage).toHaveBeenCalledWith('chunk2')
    // Note: The parser we use ignores non-'message' events by default, so the 'done' event is not captured.
    // The `data: [DONE]` is captured by the provider logic, not here.
  })

  it('should throw an error if fetch response is not ok', async () => {
    const errorResponse = { error: { message: 'Test error' } }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorResponse), {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const onMessage = vi.fn()
    await expect(fetchSSE('https://test.com/sse', { onMessage })).rejects.toThrow(
      JSON.stringify(errorResponse),
    )
  })
})
