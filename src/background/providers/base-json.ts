import { fetchJSONStream } from '../fetch-json-stream';
import { GenerateAnswerParams, Provider } from '../types';
import { handleProviderError } from '../utils';
import { FetchSSEOptions } from '../fetch-sse';

// Re-using ParsedEvent from the other base provider
import { ParsedEvent } from './base';

export abstract class BaseJsonStreamProvider implements Provider {
  constructor(protected model: string) {}

  protected abstract getFetchOptions(prompt: string): Promise<FetchSSEOptions>;

  protected abstract parseEvent(message: string): ParsedEvent | null;

  async generateAnswer(params: GenerateAnswerParams): Promise<{ cleanup?: () => void }> {
    let result: ParsedEvent = { text: '' };

    const fetchOptions = await this.getFetchOptions(params.prompt);

    await fetchJSONStream(fetchOptions.url, {
      ...fetchOptions,
      signal: params.signal,
      onMessage: (message: string) => {
        // In JSON stream, we assume every message is a complete JSON object string
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

    // After the stream is finished, send the done event.
    params.onEvent({ type: 'done' });

    return {};
  }
}
