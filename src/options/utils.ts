import { ProviderType } from '../config'

export async function loadModels(provider?: ProviderType): Promise<string[]> {
  if (provider === ProviderType.Gemini) {
    return ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro']
  }
  // Return a default list for OpenAI or when no provider is specified
  return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
}
