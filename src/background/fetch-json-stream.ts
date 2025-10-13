import { isEmpty } from 'lodash-es'
import { streamAsyncIterable } from './stream-async-iterable.js'

export async function fetchJSONStream(
  resource: string,
  options: RequestInit & { onMessage: (message: string) => void },
) {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    throw new Error(!isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`)
  }

  let buffer = ''
  const decoder = new TextDecoder()

  for await (const chunk of streamAsyncIterable(resp.body!)) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split('\n')

    // The last line may be incomplete, so we keep it in the buffer
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) { // Skip empty lines
        onMessage(line)
      }
    }
  }

  // Process any remaining data in the buffer
  if (buffer.trim()) {
    onMessage(buffer)
  }
}
