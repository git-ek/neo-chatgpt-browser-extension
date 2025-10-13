import { FetchSSEOptions } from '../fetch-sse'
import { BaseSseProvider, ParsedEvent } from './base'

export class OpenAIProvider extends BaseSseProvider {
  constructor(private token: string, model: string) {
    super(model)
  }

  private buildPrompt(prompt: string): string {
    if (this.model.startsWith('text-chat-davinci')) {
      return `Respond conversationally.<|im_end|>\n\nUser: ${prompt}<|im_sep|>\nChatGPT:`
    }
    return prompt
  }

  protected async getFetchOptions(prompt: string): Promise<FetchSSEOptions> {
    return {
      url: 'https://api.openai.com/v1/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: this.buildPrompt(prompt),
        stream: true,
        max_tokens: 2048,
      }),
    }
  }

  protected parseEvent(message: string): ParsedEvent | null {
    const data = JSON.parse(message)
    const text = data.choices[0].text

    if (text === '<|im_end|>' || text === '<|im_sep|>') {
      return null
    }

    return {
      text,
      messageId: data.id,
      conversationId: data.id,
    }
  }
}
