import { FetchSSEOptions } from '../fetch-sse'
import { BaseJsonStreamProvider } from './base-json'
import { ParsedEvent } from './base'

export class GeminiProvider extends BaseJsonStreamProvider {
  constructor(private apiKey: string, model: string) {
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
}
