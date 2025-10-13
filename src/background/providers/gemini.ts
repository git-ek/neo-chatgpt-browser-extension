// Gemini API provider for neo-chatgpt-browser-extension
import { GenerateAnswerParams, Provider } from '../types'

export class GeminiProvider implements Provider {
  constructor(private apiKey: string, private model: string) {}

  async generateAnswer(params: GenerateAnswerParams) {
    let result = ''
    await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      }),
      signal: params.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        result = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        params.onEvent({
          type: 'answer',
          data: {
            text: result,
            messageId: data.candidates?.[0]?.id || '',
            conversationId: data.candidates?.[0]?.id || '',
          },
        })
        params.onEvent({ type: 'done' })
      })
      .catch((err) => {
        params.onEvent({
          type: 'error',
          data: { error: err.message },
        })
        params.onEvent({ type: 'done' })
      })
    return {}
  }
}
