import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { fetchSSE, FetchSSEOptions } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'
import { ParsedEvent } from './base'
import { handleProviderError } from '../utils'

async function request(token: string, method: string, path: string, data?: unknown) {
  const resp = await Browser.runtime.sendMessage({
    type: 'PROXY_FETCH',
    url: `https://chat.openai.com/backend-api${path}`,
    options: {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    },
  })
  if (!resp.success) {
    throw new Error(resp.error)
  }
  // The proxy always returns a JSON object, so we wrap it to mimic a Response object
  return { json: async () => resp.data }
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
  // Also proxy the token request through the offscreen document to avoid Cloudflare issues.
  const resp = await Browser.runtime.sendMessage({
    type: 'PROXY_FETCH',
    url: 'https://chat.openai.com/api/auth/session',
    options: {
      method: 'GET',
    },
  })
  if (!resp.success) {
    throw new Error(resp.error || 'Failed to fetch access token')
  }
  const data = resp.data
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

export class ChatGPTProvider implements Provider {
  private conversationId?: string

  constructor(private token: string) {
    // model is fetched dynamically, so we don't pass it to a super constructor
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

  private async getFetchOptions(prompt: string): Promise<FetchSSEOptions> {
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

  private parseEvent(message: string): ParsedEvent | null {
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
    let result: ParsedEvent = { text: '' }

    const fetchOptions = await this.getFetchOptions(params.prompt)

    // We are not using the BaseSseProvider's generateAnswer because we need to
    // proxy the fetch request through the offscreen document.
    // The fetchSSE function is called directly with a custom fetch implementation.
    await fetchSSE(
      fetchOptions.url,
      {
        ...fetchOptions,
        signal: params.signal,
        onMessage: (message: string) => {
          if (message === '[DONE]') {
            params.onEvent({ type: 'done' })
            return
          }
          try {
            const parsed = this.parseEvent(message)
            if (parsed) {
              result = { ...result, ...parsed, text: result.text + (parsed.text || '') }
              params.onEvent({ type: 'answer', data: result })
            }
          } catch (err) {
            handleProviderError(params.onEvent, err)
          }
        },
      },
      true, // Use proxy
    )

    const cleanup = () => {
      if (this.conversationId) {
        setConversationProperty(this.token, this.conversationId, { is_visible: false })
      }
    }
    return { cleanup }
  }
}
