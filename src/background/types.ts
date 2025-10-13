import { Answer } from '../messaging'


export type Event =
  | {
      type: 'answer'
      data: Answer
    }
  | {
      type: 'done'
    }
  | {
      type: 'error'
      data: { error: string }
    }

export interface GenerateAnswerParams {
  prompt: string
  onEvent: (event: Event) => void
  signal?: AbortSignal
}

export interface Provider {
  generateAnswer(params: GenerateAnswerParams): Promise<{ cleanup?: () => void }>
}
