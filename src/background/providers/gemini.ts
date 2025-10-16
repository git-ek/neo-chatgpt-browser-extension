import { FetchSSEOptions } from '../fetch-sse'
import { BaseJsonStreamProvider } from './base-json'
import { ParsedEvent } from './base'
import { handleProviderError } from '../utils'

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

  // The Gemini API returns a JSON stream that is not SSE.
  // It's a series of JSON objects, sometimes chunked, that need to be parsed.
  // We override the default stream processing logic from the base class.
  async generateAnswer(params) {
    let result: ParsedEvent = { text: '' }
    let buffer = ''

    const fetchOptions = await this.getFetchOptions(params.prompt)

    await fetch(fetchOptions.url, {
      ...fetchOptions,
      signal: params.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // The Gemini stream sometimes starts with `[` and ends with `]`.
            // We'll clean it up and parse each object.
            const jsonObjects = buffer.replace(/^\[|\]$/g, '').split('},{')

            for (let i = 0; i < jsonObjects.length - 1; i++) {
              const jsonStr = (i > 0 ? '{' : '') + jsonObjects[i] + '}'
              this.parseAndDispatch(jsonStr, result, params.onEvent)
            }
            buffer = '{' + jsonObjects[jsonObjects.length - 1]
          }
          this.parseAndDispatch(buffer, result, params.onEvent)
          params.onEvent({ type: 'done' })
        }
        return processStream()
      })
      .catch((err) => {
        handleProviderError(params.onEvent, err)
      })

    return {}
  }

  private parseAndDispatch(jsonStr, currentResult, onEvent) {
    try {
      const data = JSON.parse(jsonStr)
      const candidate = data.candidates?.[0]
      if (!candidate) return

      const text = candidate.content?.parts?.[0]?.text
      if (!text) return

      const newResult = {
        ...currentResult,
        text: currentResult.text + text,
      }

      onEvent({
        type: 'answer',
        data: {
          text: newResult.text,
        },
      })
      // Update the reference for the next iteration
      currentResult.text = newResult.text
    } catch (err) {
      // This can happen if the JSON is incomplete, just ignore it and wait for more data
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Failed to parse Gemini stream chunk, waiting for more data.', err)
      }
    }
  }
}
