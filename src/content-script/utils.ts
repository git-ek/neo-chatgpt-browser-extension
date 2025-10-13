export function getPossibleElementByQuerySelector<T extends Element>(
  queryArray: string[],
): T | undefined {
  for (const query of queryArray) {
    const element = document.querySelector(query)
    if (element) {
      return element as T
    }
  }
}

export function endsWithQuestionMark(question: string) {
  return (
    question.endsWith('?') || // ASCII
    question.endsWith('？') || // Chinese/Japanese
    question.endsWith('؟') || // Arabic
    question.endsWith('⸮') // Arabic
  )
}

export async function isBraveBrowser() {
  return navigator.brave?.isBrave()
}

export function getErrorMessageKey(error: string): string {
  if (error.includes('network') || error.includes('Failed to fetch')) {
    return 'ext_error_network'
  }
  if (error.includes('model')) {
    return 'ext_error_model'
  }
  if (error.includes('API key') || error.includes('unauthorized')) {
    return 'ext_error_apikey'
  }
  return 'ext_error_generic'
}
