import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import { FetchSSEOptions } from '../fetch-sse'
import { GenerateAnswerParams } from '../types'
import { BaseSseProvider, ParsedEvent } from './base'

async function request(token: string, method: string, path: string, data?: unknown) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}

export async function sendMessageFeedback(token: string, data: unknown) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

const KEY_ACCESS_TOKEN = 'accessToken'

const cache = new ExpiryMap(10 * 1000)

export async function getChatGPTAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  const resp = await fetch('https://chat.openai.com/api/auth/session')
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

export class ChatGPTProvider extends BaseSseProvider {
  private conversationId?: string

  constructor(private token: string) {
    super('') // model is fetched dynamically
  }

  private async fetchModels(): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await request(this.token, 'GET', '/models').then((r) => r.json())
    return resp.models
  }

  private async getModelName(): Promise<string> {
    try {
      const models = await this.fetchModels()
      return models[0].slug
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render'
    }
  }

  protected async getFetchOptions(prompt: string): Promise<FetchSSEOptions> {
    const modelName = await this.getModelName()
    console.debug('Using model:', modelName)

    return {
      url: 'https://chat.openai.com/backend-api/conversation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [prompt],
            },
          },
        ],
        model: modelName,
        parent_message_id: uuidv4(),
      }),
    }
  }

  protected parseEvent(message: string): ParsedEvent | null {
    const data = JSON.parse(message)
    const text = data.message?.content?.parts?.[0]
    if (text) {
      this.conversationId = data.conversation_id
      return {
        text,
        messageId: data.message.id,
        conversationId: data.conversation_id,
      }
    }
    return null
  }

  async generateAnswer(params: GenerateAnswerParams): Promise<{ cleanup?: () => void }> {
    const result = await super.generateAnswer(params)

    const cleanup = () => {
      if (this.conversationId) {
        setConversationProperty(this.token, this.conversationId, { is_visible: false })
      }
    }

    result.cleanup = cleanup
    return result
  }
}
