import { FetchSSEOptions } from '../fetch-sse'
import { BaseJsonStreamProvider } from './base-json'
import { ParsedEvent } from './base'
import { GenerateAnswerParams } from '../types'

export class GeminiProvider extends BaseJsonStreamProvider {
  constructor(
    private apiKey: string,
    model: string,
  ) {
    super(model)
  }

  protected async getFetchOptions(prompt: string): Promise<FetchSSEOptions> {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    }
  }

  protected parseEvent(message: string): ParsedEvent | null {
    // The Gemini API stream may send a single '[' character as the first message.
    if (message.startsWith('[')) {
      return null
    }

    let data
    try {
      data = JSON.parse(message)
    } catch (err) {
      console.error('Failed to parse Gemini stream message', err)
      return null
    }

    const candidate = data.candidates?.[0]
    if (!candidate) {
      return null
    }

    const text = candidate.content?.parts?.[0]?.text
    if (!text) {
      return null
    }

    return {
      text,
    }
  }

  /**
   * The Gemini API returns a JSON stream that is not standard SSE.
   * It's a stream of JSON objects, sometimes chunked, that needs to be parsed manually.
   * The entire stream is wrapped in `[` and `]`.
   */
  async generateAnswer(params: GenerateAnswerParams): Promise<{ cleanup?: () => void }> {
    let result: ParsedEvent = { text: '' }
    try {
      const fetchOptions = await this.getFetchOptions(params.prompt)
      const response = await fetch(fetchOptions.url, {
        ...fetchOptions,
        signal: params.signal,
      })

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(errorBody.error.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let braceCount = 0
      let objectStartIndex = -1

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        for (let i = 0; i < buffer.length; i++) {
          const char = buffer[i]

          if (char === '{') {
            if (braceCount === 0) {
              objectStartIndex = i
            }
            braceCount++
          } else if (char === '}') {
            braceCount--
            if (braceCount === 0 && objectStartIndex !== -1) {
              const jsonStr = buffer.substring(objectStartIndex, i + 1)
              objectStartIndex = -1

              try {
                const parsed = this.parseEvent(jsonStr)
                if (parsed?.text) {
                  result = { ...result, text: result.text + parsed.text }
                  params.onEvent({ type: 'answer', data: result })
                }
              } catch (err) {
                console.debug('Error parsing Gemini JSON chunk:', jsonStr, err)
              }
            }
          }
        }

        // Keep only the unprocessed part of the buffer
        buffer = objectStartIndex !== -1 ? buffer.substring(objectStartIndex) : ''
      }
    } catch (err) {
      params.onEvent({ type: 'error', data: { error: err.message } })
    }

    params.onEvent({ type: 'done' })
    return {}
  }
}
