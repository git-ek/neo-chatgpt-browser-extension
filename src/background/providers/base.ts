
import { fetchSSE, FetchSSEOptions } from '../fetch-sse';
import { GenerateAnswerParams, Provider } from '../types';
import { handleProviderError } from '../utils';

export interface ParsedEvent {
  text: string;
  messageId?: string;
  conversationId?: string;
}

export abstract class BaseSseProvider implements Provider {
  constructor(protected model: string) {}

  protected abstract getFetchOptions(prompt: string): Promise<FetchSSEOptions>;

  protected abstract parseEvent(message: string): ParsedEvent | null;

  async generateAnswer(params: GenerateAnswerParams): Promise<{ cleanup?: () => void }> {
    let result: ParsedEvent = { text: '' };

    const fetchOptions = await this.getFetchOptions(params.prompt);

    await fetchSSE(fetchOptions.url, {
      ...fetchOptions,
      signal: params.signal,
      onMessage: (message: string) => {
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' });
          return;
        }

        try {
          const parsed = this.parseEvent(message);
          if (parsed) {
            result = {
              ...result,
              ...parsed,
              text: result.text + (parsed.text || ''),
            };
            params.onEvent({
              type: 'answer',
              data: {
                text: result.text,
                messageId: result.messageId,
                conversationId: result.conversationId,
              },
            });
          }
        } catch (err) {
          handleProviderError(params.onEvent, err);
        }
      },
    });

    return {};
  }
}
